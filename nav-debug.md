---
layout: default
---

<h1>Navigation Debug Page</h1>

<h2>All Primary Navigation Items:</h2>
<ul>
{% for item in site.data.navigation.primary %}
  <li>ID: {{ item.id }} | Title: {{ item.title }} | URL: {{ item.url }}</li>
{% endfor %}
</ul>

<h2>Testing "where" filter for specific IDs:</h2>
{% assign mobile_items = "services,portfolio,products,reviews,about,contact" | split: "," %}
{% for item_id in mobile_items %}
  <h3>Looking for: {{ item_id }}</h3>
  {% assign found = site.data.navigation.primary | where: "id", item_id | first %}
  {% if found %}
    <p>✅ Found: {{ found.title }} ({{ found.url }})</p>
  {% else %}
    <p>❌ Not found</p>
  {% endif %}
{% endfor %}
