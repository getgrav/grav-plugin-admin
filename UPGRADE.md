# Upgrading to Admin 1.10

Twig:

* **Admin link**: When linking to another admin page, use `{{ admin_route('/config/site') }}` instead of any other method, such as `{{ base_url_relative }}/config/site` (fixes multi-language issues)

