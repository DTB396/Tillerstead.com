# frozen_string_literal: true

Gem::Specification.new do |spec|
  spec.name          = "tillerstead"
  spec.version       = "0.1.0"
  spec.authors       = ["Tillerstead Team"]
  spec.email         = ["contact@tillerstead.com"]

  spec.summary       = "Tillerstead.com Jekyll site and supporting tools."
  spec.description   = "A static site and automation toolkit for Tillerstead.com, built with Jekyll and Ruby."
  spec.homepage      = "https://tillerstead.com"
  spec.license       = "MIT"

  spec.files         = Dir["{_*,assets,data,instruction docs,logs,pages,profile,reports,root-archive,scripts,terms,tests,tmp,tools}/**/*", "*.md", "*.yml", "*.rb", "*.html", "*.json"]
  spec.require_paths = ["."]

  spec.add_runtime_dependency "jekyll", ">= 3.10"
  spec.add_runtime_dependency "github-pages"
  spec.add_development_dependency "bundler"
end
