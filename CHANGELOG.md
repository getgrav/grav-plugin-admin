# v1.0.9
## 02/11/2016

1. [](#bugfix)
    * Fix language translation files

# v1.0.8
## 02/05/2016

1. [](#new)
    * Added a logout button when not authorized to access a page in Admin
    * Added the option to hide a tab from an extended blueprint (https://github.com/getgrav/grav/issues/620)
    * Many new languages and updates to existing languages from the Translation team.
1. [](#improved)
    * Check frontmatter for validity prior to saving
    * Add noindex, nofollow across the entire admin theme if no other robots headers are set on a page
    * Allow to hide a configuration blueprint section / tab and still save its values
    * Allow to show user defined blueprints in configuration
    * Updated FontAwesome to latest 4.5.0 version
1. [](#bugfix)
    * Fixed an issue with user registration on Linux caused by `glob()` possibly returning false.
    * Fixed an issue preventing Admin to work correctly in a multisite configuration
    * Fixed preview and insertion of images with non-lowercase extension
    * Fixed an incorrect number of pages being displayed in the sidebar in some cases
    * [Security] Don't reveal Grav filesystem path when trying to delete non-existing images
    * [Security] Fix PHP error happening when uploading file without extension if the JS dropzone uploader is configured to allow empty file extensions
    * [Security] Ensure correct escaping in various Twig files

# v1.0.7
## 01/15/2016

1. [](#new)
    * Added onAdminDashboard event
    * Added onAdminSave event
    * New lang strings for reverse proxy toggle
1. [](#improved)
    * More robust YAML file checking in config folders
    * Removed deprecated menu event
    * Removed old logs code
    * Used new onAdminDashboard event for current dashboard widgets 
1. [](#bugfix)
    * Fix for missing access checks on config pages #397
    * Fix parent not loaded on admin form save #587
    * When no route field is added to a page blueprint, add it as page root
    * Fix for wrong page count (will show dynamic added pages in count too - Need to fix this)
    * Fix for IE/Edge saving forms #391

# v1.0.6
## 01/07/2016

1. [](#bugfix)
    * Fix for forms appending `_json` fields on every save

# v1.0.5
## 01/07/2016

1. [](#new)
    * Added a pointer to Grav's contributing guide
    * Handle the optional logic to strip home from Page routes and urls
    * The Configuration page now shows any blueprint found in the user/blueprints/config/ folder, thus allowing to add custom configurations 
1. [](#improved)
    * Allow the nonce for a POST action to be set in the query url
    * Add a fallback twig template to use in case Twig cannot find a template file
    * Modified update Theme and Plugin buttons to use more reliably markup
1. [](#bugfix)
    * Fix additional `on` parameter when saving plugins configs that contain tabs in their blueprint
    * Fixes for the `pagemediaselect` form field 
    * Fix an untranslated message in the logout form when `system.languages.translations` is disabled
    * Fixed a hardcoded `http://` reference throwing warnings under HTTPS
    * Ensure download package has `.zip` extension, just in case

# v1.0.4
## 12/22/2015

1. [](#improved)
    * Improved File input field for admin
    * Restore file inputs functionality and process form via JS if no inputs found
1. [](#bugfix)
    * Fix for the image preview in the file field on multi-lang sites
    * Fix problem in form code introduced by fix to allow file uploads
    * Fix redirect in deleting page media

# v1.0.3
## 12/20/2015

1. [](#new)
    * Added `pagemediaselect` field for use in pages
1. [](#improved)
    * Updated various languages
    * Check for method `meetsRequirements()` prior to using
    * Enable `file` form field to be used in plugins and theme blueprints

# v1.0.2
## 12/18/2015

1. [](#bugfix)
    * Fixed issue with user edit page causing error due to individual language files

# v1.0.1
## 12/18/2015

1. [](#new)
    * Moved languages into individual files under `languages/` folder
    * Added a check for PHP version
    * Dutch translation added
1. [](#improved)
    * Let forms work with file inputs
    * Various file input improvements
    * Language updates
    * Better checks for existence of Popularity JSON data
    * Add file processing to admin forms
    * More Admin Pro integration fixes
1. [](#bugfix)
    * Set form to multipart if it contains a file field
    * `cleanFilesData()` now returns just the filename

# v1.0.0
## 12/11/2015

1. [](#new)
    * New built-in admin registration process
    * Added security check to `section` form field
    * Added new RocketTheme font with various icons
    * Add `onAdminThemeInitialized()` event to admin `Themes::init()`
    * Force timestamp on CSS/JS assets based on `GRAV_VERSION`
    * Additions for Gantry5 support
1. [](#improved)
    * Force lowercase `username` when logging in
    * Hide markdown preview except for pages
    * Added a notice if you don't have permission to see dashboard
    * Updated admin login page logic
    * Return "Invalid Security Token" instead of "Unauthorized"
    * Throw exception if you used with built-in PHP web server
    * Updated languages
    * Removed `noreply@getgrav.org` default email address
    * Use new methods to disable CSS/JS pipeline if available
    * Various code cleanups
1. [](#bugfix)
    * Handle case when email `from` is not configured
    * Fix tabs support in plugin/themes settings
    * Fix param separator in page media Ajax call
    * Fix favicon base URL

# v1.0.0-rc.7
## 12/01/2015

1. [](#new)
    * Display error page if page does not exist in admin
    * Removed Beta message option and added toggle for GitHub message
    * Added functionality to support Admin Pro plugin (in development)
1. [](#improved)
    * Added support for Markdown editor in lists #239
    * Better Markdown Editor API with dynamic initialization
    * Various language updates    
    * Removed some unused variables
    * Added admin check for pages existence
    * Prevent the admin to cause an error when an Ajax action is in progress
    * Force translations to be active even when disabled in site #299
    * Do not reinitialize `Selectize` if already available
1. [](#bugfix)
    * Fixed full-screen markdown Editor
    * Fix modular preview not working reliably #254
    * **Nonce fixes** (hopefully the last of them!)
    * Fix broken plugin enable/disable
    * Fix issue where `_redirect: /plugins` was getting stored in the plugin configuration
    * Replace default them service with admin one
    * Fix saving array fields #304
    * Fix missing translations when default language is not english
    * Fix title variables not translated #310

# v1.0.0-rc.6
## 11/21/2015

1. [](#improved)
    * Implemented logic to detect when offline and suppress Ajax calls 
    * Added nonce logic to be used by JS
1. [](#bugfix)
    * Nonce fix for updating themes
    * Nonce fix for deleting pages
    
# v1.0.0-rc.5
## 11/20/2015

1. [](#new)
    * Use **Nonce** mechanism for form security
    * Added Hungarian translation
    * Add support for Markdown labels #271
    * Added support for Markdown Editor in all the things
    * Implemented save keyboard shortcut (Ctrl + S / CMD + S)
1. [](#improved)
    * Better error for "Internal Server Error" when accessing GPM
    * Updated French translation
    * Updated Russian translation
    * Load Gravatar image with protocol-less `//:` syntax
    * Improved header UI in mobile browsers #265
    * Dropped unused version of JQuery
    * More visible Preview link icon
    * Hide **Latest pages** if there are none
    * Improved toggle to better support different length strings
1. [](#bugfix)
    * Force rescanning fields when submitting a form #243
    * Set default lang for pages on fresh session
    * Escaped values in `array.html.twig`
    * Fix saving in IE Edge
    * Fixed various typos
    * Fixed JS button issues #370
    * Fixed JS error in private browsing #272
    * Fixed date field border
    * Fixed multiple instance of Markdown Editor #285
    * Fixed Spacer CSS #267

# v1.0.0-rc.4
## 10/29/2015

1. [](#improved)
    * Changed admin menu event hook to `onAdminMenu()`
    * Minor improvements for admin page location
    * Additional lang strings for Grav 1.0.0-rc.3

# v1.0.0-rc.3
## 10/27/2015

1. [](#improved)
    * Rely on context-language for active language
    * Improved some Russian translations
    * Only show login if not already logged in
1. [](#bugfix)
    * Disable asset pipeline in admin only
    * Fix Editor cursor insertion point when text is selected in some actions

# v1.0.0-rc.2
## 10/23/2015

1. [](#bugfix)
    * Reverted lang redirect code. Needs to be reworked to be more reliable

# v1.0.0-rc.1
## 10/23/2015

1. [](#new)
    * Redirect to non-language URL except for `pages/`
1. [](#improved)
    * New language strings for new `system.yaml` fields
    * Improved Russian translations
    * Improved compatibility with PECL Yaml parser
1. [](#bugfix)
    * Redirect to correct page if you change folder/slug
    * Fix issue with Asset pipeline not being disabled in admin
    * Fix for HTML in text input fields
    * Fixed various icons in headers
    
# v0.6.2
## 10/15/2015

1. [](#improved)
    * Use `title` rather than `menu` in Page listing
    * Wrapped language strings in double-quotes
    * New language strings for new fields
1. [](#bugfix)
    * Fixed issue with IE not able to save pages

# v0.6.1
## 10/07/2015

1. [](#new)
    * Added the ability to render front-end templates in markdown preview
    * Option to disable Google-based fonts. Useful for Cyrillic languages.
    * Couple of new static helper methods used by new page blueprints
    * New `fieldset` form field (thanks @Sommerregen!)
1. [](#improved)
    * Hide editor buttons in preview mode
    * Improved support for admin when offline
    * Use relative URL in Login form
    * Added some more missing lang strings
    * Improved German translation
    * Compressed CSS files for improved performance
    * Only get last 7 days in week count calculation
1. [](#bugfix)
    * Fix saving pages in local-specific languages
    * Only track 'human' page hits in statistics
    * Responsive fixes for 'wordy' languages
    * Fixed delete issue with array field type 
    * Fixed some hardcoded `admin` references to allow admin path change
    * Fix for issue with lang code being added twice
    * Fix language name in admin buttons
    
# v0.6.0
## 09/16/2015

1. [](#new)
    * Support for custom markdown editor buttons!
    * Added Russian translations
    * Added Japanese translations
    * Ajax session keep-alive when editing forms
1. [](#improved)
    * Added missing Italian translations
    * Added additional options field into the pages form field
1. [](#bugfix)
    * Fix GPM errors in offline mode
    * Fix for duplicate status messages

# v0.5.0
## 09/11/2015

1. [](#new)
    * Responsive layout for mobile compatibility (thanks @Vivalldi!)
    * Added page type and many other new filters to Page list view
    * Added granular ACL requirements to admin pages
    * Ability to define page date format
    * Added `onAdminTemplateNavPluginHook` to allow for plugins to hook into sidebar
    * Added YAML Twig filters (to and from)
    * Support for nested metadata
    * Added ability to disable automatic update checks via admin plugin configuration
    * Initial Spanish translation
1. [](#improved)
    * Check for existence of a user account
    * Various language additions
    * Refactored form fields to remove duplicates from form plugin
    * Improved date picker
    * Improved display field
    * Add page template type to page list view
    * Various UI fixes
    * Added some default field 'focus' to save clicking
    * Only allow "Add Modular" if the theme has modular templates
    * Updated `chartist.js` library
    * Updated 'fontawesome' fonts to the latest v4.4
1. [](#bugfix)
    * Fix for "drag-n-drop" of non-image media
    * Fix a fatal error in GPM when offline
    * Fix a z-index bug with tooltips
    * Fix a z-index bug in lang dropdowns
    * Don't allow deleting of last empty array field
    * Fix for images with parenthesis in filenames
    * Fix for page title visualization when not set
    * Fix for cursor position in folder/array fields

# v0.4.3
## 08/31/2015

1. [](#new)
    * Added Japanese translation
    * Support for independent file name and template override
1. [](#improved)
    * Improved slug generation using `slugify.js`
    * Allow the `title` twig variables to set the page title
    * Improved Page media handling with several bugfixes
    * Prevent error when there are no pages on a site
    * If all updates are applied, show "Fully Updated" text in dashboard
    * Better preview link (requires `rtrim` filter from Grav 0.9.40)
    * Order all plugins and themes alphabetically
    * Removed duplicate language entries
1. [](#bugfix)
    * Fix for redirect after saving when multilang not enabled
    * Fix for deleting responsive media
    * Fix for HTML encoding in markdown field

# v0.4.2
## 08/25/2015

1. [](#bugfix)
    * Fix for current admin lang not showing up in page lang dropdown
    * Fix for incorrect NAME/CONTENT lang keys
    * Fix for incorrect site link

# v0.4.1
## 08/24/2015

1. [](#bugfix)
    * Fix for broken **Add Page** - Doh!
    * Fix for empty site link when at root

# v0.4.0
## 08/24/2015

1. [](#new)
    * Multi-language Page support!!!
    * Admin languages configurable per user
    * Toastr messages for `check updates`
    * new `tu` filter for admin translations
    * Italian and German admin translations
    * Added a save location in system and site configuration
    * Page metadata now uses flexible array field
1. [](#improved)
    * Allow subpages of modular pages to display in pages list
    * Open external pages in new tabs
    * Reworked `visibility` of pages
    * Use `PLUGIN_ADMIN` prefix for translations
    * Added link to gravatar.com to avoid confusion on avatar
    * Limit page count to 200 in ordering field
    * Fixed various Safari _flex_ issues
    * Use `rawRoute()` for page links
    * Minor `param separator` fixes
    * Various CSS fixes
    * Improved CodeMirror to force spaces
    * Added **Selectize** dropdowns to various forms and modals
1. [](#bugfix)
    * Fix for `Call to a member function path() on non-object` error
    * Fixed dropdown z-index issues
    * Correctly set the filename including language if set
    * Fix for empty taxonomies on page save
    * Fix for page not redirecting properly on folder change
    * Fix for table headers styling
    * Added missing translation strings
    * Unique page counting in total page counts
    * Fixed JS warning with page filtering and deleting


# v0.3.0
## 08/11/2015

1. [](#new)
    * Show current date in form date format fields
    * Added a new **check for updates** button to flush GPM
    * Added session timeout configuration for admin
    * Added `isSymlink` logic for Grav
    * Added new `phpinfo` page
1. [](#improved)
    * Improved toggleables
    * Support `param_separator` for Apache on windows
    * Logout now goes to interstitial to provide session messages
    * Updated hints and improved formatting
    * Encoding URI for images in editor preview
    * Create user `system.yaml` and `site.yaml` if they are missing
    * Open external links in new tab by default
    * Set edit mode to `normal` by default    
    * Disable CSS/JS pipelining in the admin
1. [](#bugfix)
    * Fixed form submission not working in IE
    * Fix fatal error when deleting homepage
    * Prevent admin plugin activating when the URL of a page contains partial route
    
# v0.2.0
## 08/06/2015

1. [](#new)
    * Added multiple **clear cache** types
    * Added back to themes link when adding new themes
    * Properly handles visibility and ordering and guesses best option on new
    * Added new templates field with support for custom (unsupported) template type
    * Added new display field for displaying simple text value
    * **Update Grav** button now works 
    * Added spanish translation
    * Added german translation
1. [](#improved)
    * Improved page order handling logic
    * Implemented 2-step theme switching logic with warning
    * Force `modular` page class for modular template
    * Clear page cache on page delete (ghost pages still showing)
    * Clears route on page save so changes such as `slug` are picked up
    * Fix dashboard layout in Safari
    * Added tooltips for official 'Team Grav' themes/plugins
1. [](#bugfix)
    * Handle modular page templates on create  
    * Fixed Firefox JS error for arrays
    * Ensure we don't change page type to empty and save (causing page to be deleted)
    * Fixed some minor CSS issues with editor
    * Fixed link to RocketTheme.com
    * Disabled fields now stay properly disabled

# v0.1.1
## 08/04/2015

1. [](#bugfix)
    * Fixed GitHub URLs
    * Hiding toggle for disabling Admin plugin
    * Removed extra text not needed

# v0.1.0
## 08/04/2015

1. [](#new)
    * ChangeLog started...
