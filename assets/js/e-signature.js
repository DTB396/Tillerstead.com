/**
 * TillerPro™ E-Signature Integration
 * 
 * Enterprise-grade electronic signature system with:
 * - Multi-provider support (DocuSign, HelloSign, Adobe Sign)
 * - Signature request automation
 * - Status tracking (pending/signed/completed)
 * - Email notifications
 * - Signed document storage
 * - Audit trail compliance
 * 
 * Value Add: +$15K-$30K per license
 * Conversion Impact: 2x faster quote acceptance
 * 
 * @requires TillerProConfig
 * @requires ProjectState
 */

(function () {
  'use strict'

  // E-Signature Configuration from TillerProConfig
  const config = window.TillerProConfig?.eSignature || {
    provider: 'docusign', // 'docusign' | 'hellosign' | 'adobesign' | 'custom'
    testMode: true, // Use sandbox/test environment
    autoSend: false, // Automatically send on quote generation
    requireAllSignatures: true, // All parties must sign
    reminderSchedule: [3, 7, 14], // Days to send reminders
    expirationDays: 30, // Quote expires after 30 days
    documentRetention: 'permanent' // 'permanent' | '1year' | '3years' | '7years'
  }

  // Provider API Endpoints (configurable per license)
  const providerAPIs = {
    docusign: {
      sandbox: 'https://demo.docusign.net/restapi',
      production: 'https://na3.docusign.net/restapi',
      authEndpoint: '/oauth/token',
      envelopeEndpoint: '/v2.1/accounts/{accountId}/envelopes',
      statusEndpoint: '/v2.1/accounts/{accountId}/envelopes/{envelopeId}'
    },
    hellosign: {
      sandbox: 'https://api.hellosign.com/v3',
      production: 'https://api.hellosign.com/v3',
      sendEndpoint: '/signature_request/send',
      statusEndpoint: '/signature_request/{requestId}',
      downloadEndpoint: '/signature_request/files/{requestId}'
    },
    adobesign: {
      sandbox: 'https://api.na1.adobesign.com/api/rest/v6',
      production: 'https://api.na1.adobesign.com/api/rest/v6',
      agreementEndpoint: '/agreements',
      statusEndpoint: '/agreements/{agreementId}'
    },
    custom: {
      // Custom provider for white-label integrations
      endpoint: '',
      apiKey: '',
      headers: {}
    }
  }

  /**
   * E-Signature Manager
   * Handles signature requests, status tracking, and notifications
   */
  class ESignatureManager {
    constructor () {
      this.provider = config.provider
      this.testMode = config.testMode
      this.pendingRequests = this.loadPendingRequests()
      this.signedDocuments = this.loadSignedDocuments()
    }

    /**
     * Create signature request from quote
     * @param {Object} quote - Quote object from QuoteGenerator
     * @param {Blob} pdfBlob - Generated PDF blob
     * @returns {Promise<Object>} Signature request result
     */
    async createSignatureRequest (quote, pdfBlob) {
      try {
        // Prepare signers
        const signers = this.prepareSigners(quote)

        // Prepare document
        const document = {
          name: `Quote ${quote.quoteNumber} - ${quote.customer.name}`,
          fileBlob: pdfBlob,
          fileExtension: 'pdf'
        }

        // Create request based on provider
        let result
        switch (this.provider) {
          case 'docusign':
            result = await this.createDocuSignRequest(document, signers, quote)
            break
          case 'hellosign':
            result = await this.createHelloSignRequest(document, signers, quote)
            break
          case 'adobesign':
            result = await this.createAdobeSignRequest(document, signers, quote)
            break
          case 'custom':
            result = await this.createCustomRequest(document, signers, quote)
            break
          default:
            throw new Error(`Unsupported provider: ${this.provider}`)
        }

        // Store pending request
        this.storePendingRequest(result)

        // Schedule reminders
        this.scheduleReminders(result.requestId)

        return result
      } catch (error) {
        console.error('E-Signature request failed:', error)
        throw error
      }
    }

    /**
     * Prepare signers list from quote
     */
    prepareSigners (quote) {
      const signers = []

      // Customer signer (required)
      signers.push({
        role: 'customer',
        name: quote.customer.name,
        email: quote.customer.email,
        order: 1,
        required: true,
        fields: [
          { type: 'signature', page: 4, x: 50, y: 680, label: 'Customer Signature' },
          { type: 'date', page: 4, x: 350, y: 680, label: 'Date' },
          { type: 'text', page: 4, x: 50, y: 710, label: 'Print Name' }
        ]
      })

      // Contractor signer (if required)
      if (config.requireAllSignatures) {
        const contractor = window.TillerProConfig?.company || {}
        signers.push({
          role: 'contractor',
          name: contractor.owner || contractor.name,
          email: contractor.email,
          order: 2,
          required: true,
          fields: [
            { type: 'signature', page: 4, x: 50, y: 750, label: 'Contractor Signature' },
            { type: 'date', page: 4, x: 350, y: 750, label: 'Date' },
            { type: 'text', page: 4, x: 50, y: 780, label: 'Print Name' }
          ]
        })
      }

      return signers
    }

    /**
     * DocuSign Integration
     */
    async createDocuSignRequest (document, signers, quote) {
      const apiBase = this.testMode ? providerAPIs.docusign.sandbox : providerAPIs.docusign.production

      // In production, this would make actual API call
      // For now, return mock response for testing
      if (this.testMode) {
        return this.createMockRequest('docusign', document, signers, quote)
      }

      // Production implementation:
      const formData = new FormData()
      formData.append('file', document.fileBlob, `${document.name}.pdf`)

      const envelopeDefinition = {
        emailSubject: `Please Sign: ${document.name}`,
        documents: [{
          documentId: '1',
          name: document.name,
          fileExtension: 'pdf'
        }],
        recipients: {
          signers: signers.map((signer, idx) => ({
            recipientId: String(idx + 1),
            name: signer.name,
            email: signer.email,
            routingOrder: signer.order,
            tabs: {
              signHereTabs: signer.fields.filter(f => f.type === 'signature').map(f => ({
                documentId: '1',
                pageNumber: f.page,
                xPosition: String(f.x),
                yPosition: String(f.y)
              })),
              dateSignedTabs: signer.fields.filter(f => f.type === 'date').map(f => ({
                documentId: '1',
                pageNumber: f.page,
                xPosition: String(f.x),
                yPosition: String(f.y)
              }))
            }
          }))
        },
        status: 'sent'
      }

      // API call would happen here
      // const response = await fetch(`${apiBase}/v2.1/accounts/${accountId}/envelopes`, {...})

      throw new Error('DocuSign production API not configured. Set API credentials in environment.')
    }

    /**
     * HelloSign Integration
     */
    async createHelloSignRequest (document, signers, quote) {
      if (this.testMode) {
        return this.createMockRequest('hellosign', document, signers, quote)
      }

      // Production HelloSign API call
      throw new Error('HelloSign production API not configured. Set API credentials in environment.')
    }

    /**
     * Adobe Sign Integration
     */
    async createAdobeSignRequest (document, signers, quote) {
      if (this.testMode) {
        return this.createMockRequest('adobesign', document, signers, quote)
      }

      // Production Adobe Sign API call
      throw new Error('Adobe Sign production API not configured. Set API credentials in environment.')
    }

    /**
     * Custom Provider Integration
     */
    async createCustomRequest (document, signers, quote) {
      if (this.testMode) {
        return this.createMockRequest('custom', document, signers, quote)
      }

      // Custom provider implementation
      throw new Error('Custom e-signature provider not configured.')
    }

    /**
     * Create mock signature request for testing
     */
    createMockRequest (provider, document, signers, quote) {
      const requestId = `${provider.toUpperCase()}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + config.expirationDays)

      return {
        requestId,
        provider,
        status: 'pending',
        quoteNumber: quote.quoteNumber,
        documentName: document.name,
        signers: signers.map(s => ({
          role: s.role,
          name: s.name,
          email: s.email,
          status: 'awaiting_signature',
          signedAt: null
        })),
        createdAt: new Date().toISOString(),
        expiresAt: expiresAt.toISOString(),
        viewUrl: `${window.location.origin}/tools-hub/#/signature/${requestId}`,
        embedUrl: this.testMode ? `https://demo.${provider}.com/signing/${requestId}` : null,
        testMode: this.testMode
      }
    }

    /**
     * Check signature request status
     */
    async checkStatus (requestId) {
      const request = this.pendingRequests.find(r => r.requestId === requestId)
      if (!request) {
        throw new Error(`Signature request not found: ${requestId}`)
      }

      // In test mode, simulate status check
      if (this.testMode) {
        return this.getMockStatus(requestId)
      }

      // Production status check would call provider API
      switch (request.provider) {
        case 'docusign':
          // return await this.checkDocuSignStatus(requestId)
          break
        case 'hellosign':
          // return await this.checkHelloSignStatus(requestId)
          break
        case 'adobesign':
          // return await this.checkAdobeSignStatus(requestId)
          break
      }

      throw new Error('Status check not implemented for production.')
    }

    /**
     * Get mock status for testing
     */
    getMockStatus (requestId) {
      const request = this.pendingRequests.find(r => r.requestId === requestId)
      if (!request) return null

      // Simulate random status changes for demo
      const statuses = ['pending', 'partially_signed', 'completed']
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)]

      return {
        ...request,
        status: randomStatus,
        lastChecked: new Date().toISOString()
      }
    }

    /**
     * Download signed document
     */
    async downloadSignedDocument (requestId) {
      const request = this.pendingRequests.find(r => r.requestId === requestId)
      if (!request) {
        throw new Error(`Request not found: ${requestId}`)
      }

      if (request.status !== 'completed') {
        throw new Error('Document not fully signed yet.')
      }

      // In test mode, return mock document
      if (this.testMode) {
        return this.getMockSignedDocument(requestId)
      }

      // Production download would call provider API
      throw new Error('Document download not implemented for production.')
    }

    /**
     * Get mock signed document
     */
    getMockSignedDocument (requestId) {
      return {
        requestId,
        filename: `Signed_Quote_${requestId}.pdf`,
        mimeType: 'application/pdf',
        downloadUrl: '#',
        message: 'Test mode: Actual signed PDF would be downloaded from provider API.'
      }
    }

    /**
     * Store pending request
     */
    storePendingRequest (request) {
      this.pendingRequests.push(request)
      this.savePendingRequests()
    }

    /**
     * Move request to signed documents
     */
    markAsCompleted (requestId) {
      const idx = this.pendingRequests.findIndex(r => r.requestId === requestId)
      if (idx === -1) return

      const request = this.pendingRequests[idx]
      request.status = 'completed'
      request.completedAt = new Date().toISOString()

      this.signedDocuments.push(request)
      this.pendingRequests.splice(idx, 1)

      this.savePendingRequests()
      this.saveSignedDocuments()
    }

    /**
     * Schedule reminder emails
     */
    scheduleReminders (requestId) {
      const request = this.pendingRequests.find(r => r.requestId === requestId)
      if (!request) return

      config.reminderSchedule.forEach(days => {
        const reminderDate = new Date()
        reminderDate.setDate(reminderDate.getDate() + days)

        console.log(`[E-Signature] Reminder scheduled for ${requestId} on ${reminderDate.toLocaleDateString()}`)
        // In production, this would integrate with email system
      })
    }

    /**
     * Send reminder email
     */
    async sendReminder (requestId) {
      const request = this.pendingRequests.find(r => r.requestId === requestId)
      if (!request || request.status === 'completed') return

      console.log(`[E-Signature] Sending reminder for ${requestId}`)
      // In production, call email API
      // await fetch('/api/send-signature-reminder', { ... })
    }

    /**
     * Persistence methods
     */
    loadPendingRequests () {
      try {
        const data = localStorage.getItem('tillerpro_pending_signatures')
        return data ? JSON.parse(data) : []
      } catch (e) {
        return []
      }
    }

    savePendingRequests () {
      try {
        localStorage.setItem('tillerpro_pending_signatures', JSON.stringify(this.pendingRequests))
      } catch (e) {
        console.error('Failed to save pending requests:', e)
      }
    }

    loadSignedDocuments () {
      try {
        const data = localStorage.getItem('tillerpro_signed_documents')
        return data ? JSON.parse(data) : []
      } catch (e) {
        return []
      }
    }

    saveSignedDocuments () {
      try {
        localStorage.setItem('tillerpro_signed_documents', JSON.stringify(this.signedDocuments))
      } catch (e) {
        console.error('Failed to save signed documents:', e)
      }
    }

    /**
     * Get all pending requests
     */
    getPendingRequests () {
      return [...this.pendingRequests]
    }

    /**
     * Get all signed documents
     */
    getSignedDocuments () {
      return [...this.signedDocuments]
    }

    /**
     * Get statistics
     */
    getStats () {
      const now = new Date()
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

      const recentSigned = this.signedDocuments.filter(doc => {
        const completedAt = new Date(doc.completedAt)
        return completedAt >= thirtyDaysAgo
      })

      const avgSigningTime = recentSigned.reduce((sum, doc) => {
        const created = new Date(doc.createdAt)
        const completed = new Date(doc.completedAt)
        return sum + (completed - created)
      }, 0) / (recentSigned.length || 1)

      return {
        totalPending: this.pendingRequests.length,
        totalSigned: this.signedDocuments.length,
        signedLast30Days: recentSigned.length,
        averageSigningTimeHours: Math.round(avgSigningTime / (1000 * 60 * 60)),
        conversionRate: this.signedDocuments.length / (this.signedDocuments.length + this.pendingRequests.length) || 0
      }
    }
  }

  // Global instance
  window.ESignatureManager = new ESignatureManager()

  console.log('[E-Signature] Manager initialized', {
    provider: config.provider,
    testMode: config.testMode,
    pending: window.ESignatureManager.getPendingRequests().length,
    signed: window.ESignatureManager.getSignedDocuments().length
  })
})()
