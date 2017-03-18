# v1.3.0-rc.2
## 03/17/2017

1. [](#improved)
    * Do not attempt to fetch any notification if settings are disabled [#942](https://github.com/getgrav/grav-plugin-admin/issues/942)

# v1.3.0-rc.1
## 03/13/2017

1. [](#new)
    * New flex-based/js Tabs system for better flexibility and improved UX.
    * Added new **toolbox** with `Direct-Install` option via ZIP or URL.
    * Added an option to reinstall a plugin/theme already installed [#984](https://github.com/getgrav/grav-plugin-admin/issues/984)
    * Added a new **range field** [#995](https://github.com/getgrav/grav-plugin-admin/issues/995)
    * When creating a new page, automatically select the Page Template based on Parent Page Child Type [#1008](https://github.com/getgrav/grav-plugin-admin/issues/1008)
1. [](#improved)
    * Page Media field now is available when folder is created, not just markdown file [#1000](https://github.com/getgrav/grav-plugin-admin/issues/1000)
    * Separated user details and avatar in separate twig to allow more granular overriding in plugins [#989](https://github.com/getgrav/grav-plugin-admin/issues/989)
    * Nicer layout of themes list on wider screen
    * Editor full-screen option displays title/save options [#948](https://github.com/getgrav/grav-plugin-admin/issues/948)
    * Use native OS highlight colors for the editor [#977](https://github.com/getgrav/grav-plugin-admin/issues/977)
    * Force admin pages to set `Page::expires(0)` so it's not cached [#1009](https://github.com/getgrav/grav-plugin-admin/issues/1009)
    * Added support for up to 15 tabs (was 10) [#954](https://github.com/getgrav/grav-plugin-admin/issues/954)
    * Only reorder pages in the admin if collection uses `@self` and `order.by`
    * Improved configuration tab sizes when you have lots of tabs
    * Modified default media select size from 150px x 100px to 200px x 150px
1. [](#bugfix)
    * Fixed rendering issue with Chrome and sortables collections [#1002](https://github.com/getgrav/grav-plugin-admin/issues/1002)
    * Fixed issue with removal of file that has been just uploaded and stored in the session
   

# v1.2.14
## 02/17/2017

1. [](#bugfix)
    * Fixed bad bug with `GPM::install()` from a change in Admin v1.2.13

# v1.2.13
## 02/17/2017

1. [](#bugfix)
    * Fix issue with validating page when switching language [#963](https://github.com/getgrav/grav-plugin-admin/issues/963)
    * Fix issue with quotes in Admin strings used in JS [#965](https://github.com/getgrav/grav-plugin-admin/issues/965)
    * Refactored `AdminController::taskGetUpdates` to use standard task/response [#980](https://github.com/getgrav/grav-plugin-admin/issues/980)
    * Sync Admin pages blueprints with core [core#212d35221a9bbcc242508ba49a551b3f6e62af8e](https://github.com/getgrav/grav/commit/212d35221a9bbcc242508ba49a551b3f6e62af8e)

# v1.2.12
## 02/12/2017

1. [](#bugfix)
    * Rebuilt the JS bundle to address various JS-related issues that cropped up in `v1.2.11`
    * Fixed Firefox Network Error issue when updating multiple plugins/themes at concurrently [#1301](https://github.com/getgrav/grav/issues/1301)

# v1.2.11
## 02/10/2017

1. [](#new)
    * Added lang strings for `CLI_COMPATIBILITY` which is new in Grav v1.1.16
1. [](#improved)
    * Allow plugin to set custom 'authorize' and 'location' in `onAdminMenu()` event
    * Updated all language files with latest from [Crowdin](https://crowdin.com/project/grav-admin)
1. [](#bugfix)
    * Fixed issue `admin.super` or `admin.users` users changing the account when saving another user [#713](https://github.com/getgrav/grav-plugin-admin/issues/713)
    * Fix issue where non `admin.super`/`admin.users` users could see other users profiles [#713](https://github.com/getgrav/grav-plugin-admin/issues/713)
    * Fix removing responsive image from page media [#111](https://github.com/getgrav/grav-plugin-admin/issues/111) [#952](https://github.com/getgrav/grav-plugin-admin/issues/952)
    * Use @2x & @3x fallback images in the filepicker. [#952](https://github.com/getgrav/grav-plugin-admin/issues/952)

# v1.2.10
## 1/30/2017

1. [](#improved)
    * It is now possible to manually specify a format for the `datetime` field [#1261](https://github.com/getgrav/grav/issues/1261)
    * Allow to see plugins and themes list without internet connection. Also add a more helpful message in the "add" view [grav#1008](https://github.com/getgrav/grav/issues/1008)
1. [](#bugfix)
    * Fixed issue with downloaded package when installing a testing release
    * Allow non admin.super users to change their account information. Allow `admin.super` and `admin.users` to change other users information. [#943](https://github.com/getgrav/grav/issues/943)
    * Handle removing a media file also if it's not a json request. Was not working after https://github.com/getgrav/grav-plugin-admin/commit/6b343365996ce838759d80fa3917d4d994f1aeb4

# v1.2.9
## 01/18/2017

1. [](#improved)
    * Added lang strings for `ALLOW_WEBSERVER_GZIP` in System configuration

# v1.2.8
## 01/17/2017

1. [](#improved)
    * Allow the ability to clear the cache if `admin.maintenance`, as stated in the docs [#908](https://github.com/getgrav/grav-plugin-admin/issues/908)
    * Added lang strings for `DEFAULT_LANG` in Site configuration
    * Added lang strings for `NEVER_CACHE_TWIG` in System and Page configuration
1. [](#bugfix)
    * Fixed saving the configuration if not `admin.super`
    * Show the clear cache buttons if the user has `admin.cache` permissions [#908](https://github.com/getgrav/grav-plugin-admin/issues/908#issuecomment-270748616)
    * Fix colorpicker validation when transparency is set to 1.00 [#921](https://github.com/getgrav/grav-plugin-admin/issues/921)
    * Fix html markup in section twig [#922](https://github.com/getgrav/grav-plugin-admin/pull/922)
    * Fix bug in deleting a file uploaded with the `file` field [#920](github.com/getgrav/grav-plugin-admin/issues/920)
    * Fix for plugin throwing event-based errors when plugin is removed and no longer available to process said event

# v1.2.7
## 12/22/2016

1. [](#improved)
    * Fixed an issue with non `.html` extensions not setting application type properly when fallback template not found.
1. [](#bugfix)
    * Fix plugins and themes json calls after the introduction of [HTML fallback for templates not found](https://github.com/getgrav/grav/commit/364209a27da0f5dfba5fde9c4b07b6d5844cda47)


# v1.2.6
## 12/21/2016

1. [](#improved)
    * Added a delay before reloading the page when a plugin or theme get installed
    * Fix prompting to remove Grav itself when removing a package that requires a specific Grav version
    * Remove cli-server exception since we now have compatibility with a custom router in Grav [#1219](https://github.com/getgrav/grav/pull/1219)
1. [](#bugfix)
    * Fix issue with array field and `value_only: true`

# v1.2.5
## 12/13/2016

1. [](#new)
    * RC released as stable
1. [](#bugfix)
    * YAML syntax fixes

# v1.2.5-rc.4
## 12/07/2016

1. [](#new)
    * Added a new `permissions` form field, used in the user profile to simplify editing permissions
    * Added several new `onAdminAfter...()` events to allow for more 3rd party plugin interaction
1. [](#bugfix)
    * Updated admin-user-details to allow longer user names in the sidebar [#879](https://github.com/getgrav/grav-plugin-admin/issues/879)
    * Redirect to a 404 page when accessing nonexistent plugins and themes [#880](https://github.com/getgrav/grav-plugin-admin/issues/880)

# v1.2.5-rc.3
## 11/26/2016

1. [](#bugfix)
    * Update class namespace for Admin class [#874](https://github.com/getgrav/grav-plugin-admin/issues/874)
    * Fix updating/installing packages from admin

# v1.2.5-rc.2
## 11/19/2016

1. [](#bugfix)
    * Make default value work for filepicker [#859](https://github.com/getgrav/grav-plugin-admin/issues/859)

# v1.2.5-rc.1
## 11/09/2016

1. [](#new)
    * Updated to FontAwesome 4.7.0 with [Grav icon](http://fontawesome.io/icon/grav/)
1. [](#improved)
    * Always delete image alternatives in AdminController#taskDelmedia [#814](https://github.com/getgrav/grav-plugin-admin/issues/814)
    * Use Media class to retrieve files in AdminController#taskGetFilesInFolder [#842](https://github.com/getgrav/grav-plugin-admin/issues/842)
    * Increased specificity for Colorpicker field to prevent 3rd party conflicts
1. [](#bugfix)
    * Editor link button doesn't prefix links with `http://` anymore [#813](https://github.com/getgrav/grav-plugin-admin/issues/813)
    * Dashboard Charts now always refresh no matter what [#753](https://github.com/getgrav/grav-plugin-admin/issues/753)
    * Use rawRoute for parent too when saving [#843](https://github.com/getgrav/grav-plugin-admin/issues/843)
    * Avoid different output when users exist or not in password recovery [#849](https://github.com/getgrav/grav/issues/849)
    * Fix login to admin with permission inherited from group [#857](https://github.com/getgrav/grav-plugin-admin/issues/857)


# v1.2.4
## 10/22/2016

1. [](#bugfix)
    * Fix for accented media files [#833](https://github.com/getgrav/grav-plugin-admin/issues/833)
    * Fix for `CTRL + s` not saving in editor [#832](https://github.com/getgrav/grav-plugin-admin/pull/832)
    * Fix for missing REDIS translations in admin [#1123](https://github.com/getgrav/grav/issues/1123)

# v1.2.3
## 10/19/2016

1. [](#new)
    * Added new `onAdminCreatePageFrontmatter()` event to support plugins such as `auto-date` by allowing frontmatter to be modified by plugins.
    * Added a new independent `cache_enabled` option for admin plugin (default is `false`). Should fix various sync issues.
    * Add an `onAdminData` event to allow plugins to add additional blueprints data
1. [](#improved)
    * Handle errors when a resource fails to install
    * Page media and File field images thumbnail are now properly proportionate and 150x100
    * Added the Codeception testing suite with an initial test
1. [](#bugfix)
    * Fix [#1034](https://github.com/getgrav/grav/issues/1034) redirect of page creation procedure when system.home.hide_in_urls is enabled
    * Media (Page): Do not extend parent metehod for sending files since Safari and IE API for FormData don’t implement `delete` ([#772](https://github.com/getgrav/grav-plugin-admin/issues/772))
    * Clean up POST keys containing square brackets, allows for regex ranges in routes ([#776](https://github.com/getgrav/grav-plugin-admin/issues/776))
    * Fix [#773](https://github.com/getgrav/grav-plugin-admin/issues/773) allow filepicker work inside lists, respond to mutation event
    * Better error handling for Feed when unable to connect
    * Fixed UI for Pagemedia note when files cannot yet be uploaded ([#798](https://github.com/getgrav/grav-plugin-admin/issues/798))
    * Fixed Submit buttons getting disabled in case of form invalidity disallowing to submit again ([#802](https://github.com/getgrav/grav-plugin-admin/issues/802))
    * Fixed issue when reading the file size setting if set to `0` (in Pagemedia and File fields)
    * Fixed issue with `file` field in collections that caused unexpected duplication of items ([#775](https://github.com/getgrav/grav-plugin-admin/issues/775))
    * Dramatically improved `filepicker` performance. Data is only ever loaded when the drop-down is on focus, as it was supposed to be. Image preview of a selected item won't be rendered unless the field gains focus to avoid wasting resources. ([#788](https://github.com/getgrav/grav-plugin-admin/issues/788))
    * Allow `filepicker` field to peak at the pending uploaded files and optimistically select them ([#792](https://github.com/getgrav/grav-plugin-admin/issues/792))
    * Fix [#821](https://github.com/getgrav/grav-plugin-admin/issues/821) issue in saving a page to a new language when the filename does not contain the filename yet.

# v1.2.2
## 09/08/2016

1. [](#bugfix)
    * Fix [#767](https://github.com/getgrav/grav-plugin-admin/issues/767) Add styling for new HTML5 input field types
    * Fix issue with checking the package dependencies when more than one package is being inspected

# v1.2.1
## 09/07/2016

1. [](#bugfix)
    * Fixed `tmp://` stream issue with Admin updated to 1.2 before Grav updated 1.1.4

# v1.2.0
## 09/07/2016

1. [](#new)
    * All new `file` field. All files get uploaded via Ajax and are stored upon Save. This improves the Save task tremendously as now there is no longer the need of waiting for the files to finish uploading. Fully backward compatible, `file` field now includes also a `limit` and `filesize` option in the blueprints. The former determines how many files are allowed to be uploaded when in combination with `multiple: true` (default: 10), the latter determines the file size limit (in MB) allowed for each file (default: 5MB)
    * Added a new `filepicker` field, which allows to pick any file from an ajax-powered select box. The `pagemediaselect` field now internally uses the `filepicker` field to live-reload the available files, and to show image previews.
1. [](#improved)
    * Better error handling for 500 Internal Server Errors, when Fetch fails
    * Various notifications style and other CSS fixes
    * More language strings added
    * Added `clear-tmp` to cache clear drop-down
    * Unified JSON twig templates
    * Better error handling for 500 Internal Server Errors, when Fetch fails.
    * Updated vendor Libraries
1. [](#bugfix)
    * Curl fix for invalid cert errors with News Feed
    * Avoid requiring `admin.super` for ajax calls [#739](https://github.com/getgrav/grav-plugin-admin/issues/739)
    * Fix showing HTML in notifications, in the feed
    * Fixed broken page type filtering
    * Fixed `beforeunload` event not prompting to offer the choice to stay on the page in case of unsaved changes
    * Fixed click-away detection for preventing loss of changes, that would get ignored in some circumstances (ie, from modal confirmation)
    * Fixed issue with `_json` elements where nested fields merging would get stored in an unexpected way
    * Fixed composer dependencies missing error message

# v1.1.4
## 08/14/2016

1. [](#bugfix)
    * Fixed Firefox News Feed dashboard widget layout

# v1.1.3
## 08/10/2016

1. [](#new)
    * Admin notifications system.  Admin will pull and cache notifications.  This will be used to announce important updates, security vulnerabilities, and general interest news.
    * Ability to disable widgets in the dashboard
    * Added news feed widget to the dashboard
1. [](#improved)
    * Updated FontAwesome to v4.6.3
    * Use new List functionality for Media Configuration
    * Get fresh media list for `Controller::getListMedia()` rather that cache so always latest.
    * Add translation strings for the new system.force_ssl option
    * Reworked List UI to better handle drag & drop sort. To sort it is now required to use the left drag handle [#724](https://github.com/getgrav/grav-plugin-admin/issues/724)
    * Lists now features a new YAML option `controls: [top|bottom|both]` (default: bottom) which will display the "Add Item" button at the Top and/or Bottom position relative to the list. When the Top button is pressed, a new item will be added at the beginning of the list, when the Bottom button is pressed, a new item will be appended to the list.
    * Lists now features two new YAML options `sortby: [field]` (default: disabled) and `sortby_dir: [asc|desc]` (default: asc) which will display a new Sorting button in the list allowing to automatically reindex the collection based on the given sort field set.
    * Lists now features a new YAML option `collapsed: [true|false]` (default: false) and a new UI/UX that allows for collapsing / expanding collection items, allowing to better managing long lists of items. It is advised to always put as first field the most significant one, so that when a list is collapsed it can be still easily browsed.
    * It is now possible to sort Array fields via drag & drop [#950](https://github.com/getgrav/grav/issues/950)
1. [](#bugfix)
    * Fixed issue in Admin favicon URL [#704](https://github.com/getgrav/grav-plugin-admin/issues/704)
    * Fixed issue in `selfupgrade` where the package would get downloaded in the wrong destination
    * Hide tab when user is not authorized to access it [#712](https://github.com/getgrav/grav-plugin-admin/issues/712)
    * Fixed Lists issue when reindexing, causing Radio fields to potentially lose their `checked` status
    * Avoid overwriting a file when uploaded with the same filename through the Admin blueprint `file` field type if `avoid_overwriting` is enabled on the field
    * Fixed issue with Array field in `value_only` mode, improperly displaying the key when no value was set
    * Translate the description of a blueprint field [#729](https://github.com/getgrav/grav-plugin-admin/issues/729)

# v1.1.2
## 07/16/2016

1. [](#improved)
    * Forcing limit of upload files based on System settings
1. [](#bugfix)
    * Definitive fix for multi form submission in Microsoft Edge causing the Save to not work [#694](https://github.com/getgrav/grav-plugin-admin/issues/694)
    * Fix issue with calculating the `theme_url` with `open_basedir` restrictions [#699](https://github.com/getgrav/grav-plugin-admin/issues/699)
    * Check for null payload before going on [#526](https://github.com/getgrav/grav-plugin-admin/issues/526)
    * Redraw Dashboard Charts when collapsing/expanding the sidebar
    * Fix for `cache/compiled` errors resulting from page media uploads [getgrav/grav#938](https://github.com/getgrav/grav/issues/938)

# v1.1.1
## 07/14/2016

1. [](#bugfix)
    * Fixed issue with forms causing creation of new pages not to work [#698](https://github.com/getgrav/grav-plugin-admin/issues/698) and [getgrav/grav#934](https://github.com/getgrav/grav/issues/934)

# v1.1.0
## 07/14/2016

1. [](#improved)
    * Added the ability to login with the email in addition to the username. [#674](https://github.com/getgrav/grav-plugin-admin/issues/674)
    * It is now possible to sort the Plugins and Themes views by 'Name', 'Author', 'GravTeam', 'Release Date', 'Updates Available' and 'Testing' releases (if in Testing Channel), both Ascending and Descending. [#583](https://github.com/getgrav/grav-plugin-admin/issues/583)
    * Prevent external links (like the Preview button) to trigger the "Changes Detected" notice [#689](https://github.com/getgrav/grav-plugin-admin/issues/689)
    * Added a filter field in Plugins and Themes list views, to allow for quick search of a particular resource
    * Added new `Enabled` sorting option for Plugins list view
1. [](#bugfix)
    * Fixed an issue that prevented removing more than one page, in the pages listng [#672](https://github.com/getgrav/grav-plugin-admin/issues/672)
    * Fixed toggleables in lists that were always loading as checked even when not stored [#688](https://github.com/getgrav/grav-plugin-admin/issues/688)
    * Fixed Fullscreen tooltip in Editor displaying off screen (when in fullscreen mode) [#677](https://github.com/getgrav/grav-plugin-admin/issues/677)
    * Fixed inconsistency in the way selectized fields would be rendered [#692](https://github.com/getgrav/grav-plugin-admin/issues/692)
    * Fixed issue with Save in Microsoft Edge [#694](https://github.com/getgrav/grav-plugin-admin/issues/694)

# v1.1.0-rc.4
## 06/21/2016

1. [](#bugfix)
    * Fix for 'front-end' shortcut showing in mobile sidebar incorrectly.
    * Append progressive number to the copied page title. [#394](https://github.com/getgrav/grav-plugin-admin/issues/394)
    * Add field description to forms [#667](https://github.com/getgrav/grav-plugin-admin/pull/667)
    * Fix clearing all cache [#658](https://github.com/getgrav/grav-plugin-admin/issues/658)
    * Assign the correct ordering when saving a page that didn't have ordering set before [#628](https://github.com/getgrav/grav-plugin-admin/issues/628)
    * Fix issue when saving a modular child folder as 05.somethin and being reset to 01.something upon save [#628](https://github.com/getgrav/grav-plugin-admin/issues/628)

# v1.1.0-rc.3
## 06/14/2016

1. [](#bugfix)
    * Fix for Gemini Scrollbar CSS breaking layout in IE 9+ [#644](https://github.com/getgrav/grav-plugin-admin/issues/644)
    * Fall back to english for UI language if admin's language is not set [#641](https://github.com/getgrav/grav-plugin-admin/issues/641)
    * List field has the wrong label/field width.  Switched to "1/3 | 2/3" like all other fields.
    * Correctly set the page slug on page copy. Avoids having two pages with the same slug [#394](https://github.com/getgrav/grav-plugin-admin/issues/394)
    * When copying a page, if there's a page prefix (used for ordering), update the value to avoid having two pages with the same order number [#429](https://github.com/getgrav/grav-plugin-admin/issues/429)
    * Fixed size of dropdown text in responsive views to be readable [#647](https://github.com/getgrav/grav-plugin-admin/issues/647)
    * Fixed issue with checkbox in toggleables getting submitted with the form even when disabled (fixes #646)

# v1.1.0-rc.2
## 06/02/2016

1. [](#improved)
    * Cleaned up the Page Preview CSS to make it more 'standard' [#634](https://github.com/getgrav/grav-plugin-admin/issues/634)
    * Added a legend with the Page colors explained [#637](https://github.com/getgrav/grav-plugin-admin/issues/637)
    * Hide email output when sending forgot password instructions [#571](https://github.com/getgrav/grav-plugin-admin/issues/571)
1. [](#bugfix)
    * Fixed "Data type `System` doesn't exist!" error when activating a theme [#635](https://github.com/getgrav/grav-plugin-admin/issues/635)
    * Fixed issue with custom media types not deleting on save [#633](https://github.com/getgrav/grav-plugin-admin/issues/633)
    * Fixed issue when saving `List` field type in plugins + pages
    * Fixed JS error on login/logout page due to jQuery not being loaded


# v1.1.0-rc.1
## 06/01/2016

1. [](#new)
    * Major improvements with the **File Upload** (`file`) field type.  Now fully supports themes, plugins, configuration + pages
1. [](#improved)
    * Updated with latest languages via [Crowdin](https://crowdin.com/project/grav-admin/)
    * Provide security options for single tabs [#615](https://github.com/getgrav/grav-plugin-admin/issues/615)
    * Disable double clicking on Save/Delete/Copy page actions [#611](https://github.com/getgrav/grav-plugin-admin/issues/611)
    * Tweaked the avatar alignment in sidebar [#592](https://github.com/getgrav/grav-plugin-admin/issues/592)
    * Added page name to delete dialog [#511](https://github.com/getgrav/grav-plugin-admin/issues/511)
    * Enabling / Disabling a Plugin doesn't trigger the expand / collapse details anymore [#614](https://github.com/getgrav/grav-plugin-admin/issues/614)
    * Added hover on plugins list rows to match pages [#619](https://github.com/getgrav/grav-plugin-admin/issues/619)
    * Translate media configuration [#608](https://github.com/getgrav/grav-plugin-admin/issues/608)
    * Use raw routes in blueprints to better support multi-language [#798](https://github.com/getgrav/grav-plugin-admin/issues/798)
    * Updated NPM modules dependencies
1. [](#bugfix)
    * Fix double "Removed successfully" appearing when removing a package [#609](https://github.com/getgrav/grav-plugin-admin/issues/609)
    * Prevent removing required plugins dependencies when removing a package [#613](https://github.com/getgrav/grav-plugin-admin/issues/613)
    * Show page title in Delete Confirmation modal if this information is available
    * Don't try to uninstall admin/form/login/email plugins
    * Only check for updates if not `admin.maintenance` or `admin.super` [#557](https://github.com/getgrav/grav-plugin-admin/issues/557)
    * Always submit checkboxes that are not checked and force a 0 value [#616](https://github.com/getgrav/grav-plugin-admin/issues/616)
    * Fix encoding in tooltips again [#622](https://github.com/getgrav/grav-plugin-admin/issues/622)
    * Do not show `move` cursor for Collections that aren't sortable [#624](https://github.com/getgrav/grav-plugin-admin/issues/624)
    * Properly handle Collections that specify a custom key, rather than falling back to indexed list [#632](https://github.com/getgrav/grav-plugin-admin/issues/632)

# v1.1.0-beta.5
## 05/23/2016

1. [](#improved)
    * Set sidebar navigation defaults back to "Tab Activation" and "Auto Width"
    * Custom logo text is displayed as first letter in small sidebar view [#829](https://github.com/getgrav/grav/issues/829)
    * Copied admin-only blueprints from Grav core to the Admin plugin
    * Allow `field.label` to have HTML in it [#601](https://github.com/getgrav/grav-plugin-admin/issues/601)
1. [](#bugfix)
    * Fixed Togggle field with doubled `checked="checked"` when `toggleable: true` [#579](https://github.com/getgrav/grav-plugin-admin/issues/579)
    * Strip HTML tags and lowercase username from login/reset forms [#577](https://github.com/getgrav/grav-plugin-admin/issues/577)
    * Fixed issue with version numbers not showing up for dependencies [#581](https://github.com/getgrav/grav-plugin-admin/issues/581)
    * Fixed editor tooltips in fullscreen mode and tablet devices rendering [#566](https://github.com/getgrav/grav-plugin-admin/issues/566)
    * Fixed issue with `file` form field not functioning [#838](https://github.com/getgrav/grav/issues/838)
    * Fixed issue with creating pages [#595](https://github.com/getgrav/grav-plugin-admin/issues/595)

# v1.1.0-beta.4
## 05/09/2016

1. [](#new)
    * Implemented Quickopen functionality to automatically open / close the Sidebar when mouseover
1. [](#improved)
    * Better error handling when `obj->validate()` fails with exception [#594](https://github.com/getgrav/grav-plugin-admin/issues/564)
    * Improve markup of update and add package dependencies in update modal [#560](https://github.com/getgrav/grav-plugin-admin/issues/560)
1. [](#bugfix)
    * Fix for admin translation filter (`|tu`) not substituting text - [#567](https://github.com/getgrav/grav-plugin-admin/issues/567)
    * Translated "Publishing" tab text [#561](https://github.com/getgrav/grav-plugin-admin/issues/561)
    * Fix invalid argument supplied in foreach [#563](https://github.com/getgrav/grav-plugin-admin/issues/563)
    * CSS fixes for editor button alignment
    * Fix for forgot password not finding anyone
    * Fix UI issue with update button on a package page in Firefox
    * Fix issue with update button when automatic check for updates is disabled
    * Fix issue caused by clicking "Check for updates" multiple times
    * Added missing translations
    * Fix for Themes with an array of keywords [#823](https://github.com/getgrav/grav/issues/823)

# v1.1.0-beta.3
## 05/04/2016

1. [](#new)
    * Added a `|adminNicetime` Twig filter to show 'nicetime' in admin user's language
    * Added a `prepend` and `append` field option for text input type
    * Added a WIP `onAdminRegisterPermissions` event
    * Added several new languages: Arabic, Danish, Greek, Farsi, Korean, Romanian, Thai. Huge thanks to the [translation teams](https://crowdin.com/project/grav-admin)
1. [](#improved)
    * Fixed UI issue with Backup / Update buttons positioning
    * Tweaked placeholders color in login/new user panels [#542](https://github.com/getgrav/grav-plugin-admin/issues/542)
1. [](#bugfix)
    * Fixed several untranslated strings
    * Fix the version information after updating Grav from Admin
    * Fix a Twig autoescape issue on Plugins descriptions
    * Fix for showing empty drop-down with only one supported language [#522](https://github.com/getgrav/grav-plugin-admin/issues/522)
    * Fix for visibility toggle on new page not working [#551](https://github.com/getgrav/grav-plugin-admin/issues/551)
    * Page tooltips usability issue [#496](https://github.com/getgrav/grav-plugin-admin/issues/496)
    * Fix removed title attribute from editor toolbar buttons [#539](https://github.com/getgrav/grav-plugin-admin/issues/539)
    * Allow Incognito / Private browsing to still function in Safari [#527](https://github.com/getgrav/grav-plugin-admin/issues/527)

# v1.1.0-beta.2
## 04/27/2016

1. [](#new)
    * Added `grav ~1.1` to dependencies
    * Added a persistent message if you try to run Admin 1.1 on Grav 1.0
1. [](#improved)
    * Used locator instead of `CACHE_DIR`
    * Added a better way to get Admin version
    * Show account page for users with certain ACL [#524](https://github.com/getgrav/grav-plugin-admin/pull/524)
1. [](#bugfix)
    * Fixed Editor Preview using wrong parameters for the ajax call
    * Fixed toggle for stable/testing channel
    * Fixed blueprint JSON fields
    * If not logged in redirect to base path [#445](https://github.com/getgrav/grav-plugin-admin/pull/445)
    * Various autoescape fixes
    * ColorPicker CSS fixes
    * Fix for translation of admin login [#500](https://github.com/getgrav/grav-plugin-admin/issues/500)
    * Fix list not applying `toggleable: true` and `style: vertical` [#518](https://github.com/getgrav/grav-plugin-admin/pull/518)
    * Fixed issue with update for wrong plugin displaying on plugin details pages
    * Fixed error with the **close sidebar** toggle in some browsers (Firefox, iOS Safari)

# v1.1.0-beta.1
## 04/20/2016

1. [](#new)
    * JavaScript Rewrite. Admin is now built in ES6
    * Lists can now be nested and 'fancy fields' (such as editor, datetime picker, selectize, other lists) get automatically initialized so they are always available no matter if you add or remove items from the lists
    * The Editor has been reworked to be more flexible. In fact you can now pass any CodeMirror setting via blueprints, through the codemirror: attribute. The buttons have also a new API that allow to add or ignore buttons and behaviors into the toolbar from any plugin (see grav-plugin-editor-buttons). We also added the headers buttons (H1-H6) and Undo / Redo buttons, due to popular demand
    * We introduced a new colorpicker field. You can now add more colors to your admin plugins :)
    * Along with the versioning support added in the Grav Core for 1.1, the admin plugin can now install dependencies with the same versioning requirements as the GPM CLI commands.
    * New System configuration field for toggling GPM release version (testing/stable)
    * Several new system configuration options for new functionality such as `Process frontmatter Twig`
    * Ability to collapse the sidebar to a smaller icon view if you need more room.
1. [](#improved)
    * The default Grav theme has been tweaked and in many places completely rewritten to ensure that it's as flexible as possible. The primary reason for this was to ensure theming and customization compatibility for the upcoming Admin Pro plugin, but a key benefit includes greatly improved mobile compatibility.
    * We reworked the Datetimepicker, you will notice a new refreshed UI with a much better support for translations
    * Tabs are now persistent. In views such as Page editing, when switching tab and saving or refreshing, would cause the tab to be reset to the initial one.
    * When editing a page in Expert mode, the frontmatter editor is now more friendly. You will now get line numbers, undo/redo and YAML linter.
    * Behind the scenes we have reworked how the form and toggleables work. This added a lot more reliability and consistency across the whole admin.
    * The Pages view has more persistent states. It will now remember your expanded/collapsed states as well as filtering.
    * Lists can now accept a custom button label with the 'btnLabel' property
    * After login to Admin, redirect to the original URL called
    * Admin now has an unique cache key compared to the 'site' so pages can be cached independently
    * Improved the layout of the User Profile page.
    * Set cache key uniquely for admin so cache does not colide with site
1. [](#bugfix)
    * Fix for modular preview - [#254](https://github.com/getgrav/grav-plugin-admin/issues/254)
    * Fix for long content and page tabs - [#441](https://github.com/getgrav/grav-plugin-admin/issues/441)
    * Fix for clear cache after adding new folder - [#393](https://github.com/getgrav/grav-plugin-admin/issues/393)

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
