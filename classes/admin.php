<?php
namespace Grav\Plugin;

use DateTime;
use Grav\Common\Data;
use Grav\Common\File\CompiledYamlFile;
use Grav\Common\GPM\GPM;
use Grav\Common\Grav;
use Grav\Common\Language\LanguageCodes;
use Grav\Common\Page\Page;
use Grav\Common\Page\Pages;
use Grav\Common\Plugins;
use Grav\Common\Themes;
use Grav\Common\Uri;
use Grav\Common\User\User;
use Grav\Common\Utils;
use Grav\Plugin\Admin\Utils as AdminUtils;
use RocketTheme\Toolbox\File\File;
use RocketTheme\Toolbox\File\JsonFile;
use RocketTheme\Toolbox\ResourceLocator\UniformResourceIterator;
use RocketTheme\Toolbox\ResourceLocator\UniformResourceLocator;
use RocketTheme\Toolbox\Session\Message;
use RocketTheme\Toolbox\Session\Session;
use Symfony\Component\Yaml\Yaml;

define('LOGIN_REDIRECT_COOKIE', 'grav-login-redirect');

class Admin
{
    /**
     * @var Grav
     */
    public $grav;

    /**
     * @var Uri $uri
     */
    protected $uri;

    /**
     * @var array
     */
    protected $pages = [];

    /**
     * @var Session
     */
    protected $session;

    /**
     * @var Data\Blueprints
     */
    protected $blueprints;

    /**
     * @var string
     */
    public $base;

    /**
     * @var string
     */
    public $location;

    /**
     * @var string
     */
    public $route;

    /**
     * @var User
     */
    public $user;

    /**
     * @var GPM
     */
    protected $gpm;

    /**
     * @var int
     */
    protected $pages_count;

    /**
     * @var Array
     */
    protected $permissions;

    /**
     * Constructor.
     *
     * @param Grav   $grav
     * @param string $base
     * @param string $location
     * @param string $route
     */
    public function __construct(Grav $grav, $base, $location, $route)
    {
        $this->grav = $grav;
        $this->base = $base;
        $this->location = $location;
        $this->route = $route;
        $this->uri = $this->grav['uri'];
        $this->session = $this->grav['session'];
        $this->user = $this->grav['user'];
        $this->permissions = [];
        $language = $this->grav['language'];

        // Load utility class
        require_once __DIR__ . '/utils.php';

        if ($language->enabled()) {
            $this->multilang = true;
            $this->languages_enabled = $this->grav['config']->get('system.languages.supported', []);

            //Set the currently active language for the admin
            $language = $this->grav['uri']->param('lang');
            if (!$language) {
                if (!$this->session->admin_lang) {
                    $this->session->admin_lang = $this->grav['language']->getLanguage();
                }
                $language = $this->session->admin_lang;
            }
            $this->grav['language']->setActive($language ?: 'en');
        } else {
            $this->grav['language']->setActive('en');
            $this->multilang = false;
        }

    }

    /**
     * Get current session.
     *
     * @return Session
     */
    public function session()
    {
        return $this->session;
    }

    /**
     * Add message into the session queue.
     *
     * @param string $msg
     * @param string $type
     */
    public function setMessage($msg, $type = 'info')
    {
        /** @var Message $messages */
        $messages = $this->grav['messages'];
        $messages->add($msg, $type);
    }

    /**
     * Fetch and delete messages from the session queue.
     *
     * @param string $type
     *
     * @return array
     */
    public function messages($type = null)
    {
        /** @var Message $messages */
        $messages = $this->grav['messages'];

        return $messages->fetch($type);
    }

    /**
     * Authenticate user.
     *
     * @param  array $data Form data.
     * @param  array $post Additional form fields.
     *
     * @return bool
     */
    public function authenticate($data, $post)
    {
        if (!$this->user->authenticated && isset($data['username']) && isset($data['password'])) {
            // Perform RegEX check on submitted username to check for emails
            if (filter_var($data['username'], FILTER_VALIDATE_EMAIL)) {
                $user = AdminUtils::findUserByEmail($data['username']);
            } else {
                $user = User::load($data['username']);
            }

            //default to english if language not set
            if (empty($user->language)) {
                $user->set('language', 'en');
            }

            if ($user->exists()) {
                $user->authenticated = true;

                // Authenticate user.
                $result = $user->authenticate($data['password']);

                if ($result) {
                    $this->user = $this->session->user = $user;

                    /** @var Grav $grav */
                    $grav = $this->grav;

                    unset($this->grav['user']);
                    $this->grav['user'] = $user;

                    $this->setMessage($this->translate('PLUGIN_ADMIN.LOGIN_LOGGED_IN'), 'info');
                    $grav->redirect($post['redirect']);
                }
            }
        }

        return $this->authorize();
    }

    /**
     * Checks user authorisation to the action.
     *
     * @param  string $action
     *
     * @return bool
     */
    public function authorize($action = 'admin.login')
    {
        $action = (array)$action;

        foreach ($action as $a) {
            if ($this->user->authorize($a)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Returns edited page.
     *
     * @param bool $route
     *
     * @return Page
     */
    public function page($route = false, $path = null)
    {
        if (!$path) {
            $path = $this->route;
        }

        if ($route && !$path) {
            $path = '/';
        }

        if (!isset($this->pages[$path])) {
            $this->pages[$path] = $this->getPage($path);
        }

        return $this->pages[$path];
    }

    /**
     * Returns blueprints for the given type.
     *
     * @param string $type
     *
     * @return Data\Blueprint
     */
    public function blueprints($type)
    {
        if ($this->blueprints === null) {
            $this->blueprints = new Data\Blueprints('blueprints://');
        }

        return $this->blueprints->get($type);
    }

    /**
     * Gets configuration data.
     *
     * @param string $type
     * @param array  $post
     *
     * @return Data\Data|null
     * @throws \RuntimeException
     */
    public function data($type, array $post = [])
    {
        static $data = [];

        if (isset($data[$type])) {
            return $data[$type];
        }

        if (!$post) {
            $post = isset($_POST['data']) ? $_POST['data'] : [];
        }

        /** @var UniformResourceLocator $locator */
        $locator = $this->grav['locator'];
        $filename = $locator->findResource("config://{$type}.yaml", true, true);
        $file = CompiledYamlFile::instance($filename);

        if (preg_match('|plugins/|', $type)) {
            /** @var Plugins $plugins */
            $plugins = $this->grav['plugins'];
            $obj = $plugins->get(preg_replace('|plugins/|', '', $type));

            if (!$obj) {
                return [];
            }

            $obj->merge($post);
            $obj->file($file);

            $data[$type] = $obj;
        } elseif (preg_match('|themes/|', $type)) {
            /** @var Themes $themes */
            $themes = $this->grav['themes'];
            $obj = $themes->get(preg_replace('|themes/|', '', $type));

            if (!$obj) {
                return [];
            }

            $obj->merge($post);
            $obj->file($file);

            $data[$type] = $obj;
        } elseif (preg_match('|users/|', $type)) {
            $obj = User::load(preg_replace('|users/|', '', $type));
            $obj->merge($post);

            $data[$type] = $obj;
        } elseif (preg_match('|user/|', $type)) {
            $obj = User::load(preg_replace('|user/|', '', $type));
            $obj->merge($post);

            $data[$type] = $obj;
        } elseif (preg_match('|config/|', $type)) {
            $type = preg_replace('|config/|', '', $type);
            $blueprints = $this->blueprints("config/{$type}");
            $config = $this->grav['config'];
            $obj = new Data\Data($config->get($type, []), $blueprints);
            $obj->merge($post);

            // FIXME: We shouldn't allow user to change configuration files in system folder!
            $filename = $this->grav['locator']->findResource("config://{$type}.yaml")
                ?: $this->grav['locator']->findResource("config://{$type}.yaml", true, true);
            $file = CompiledYamlFile::instance($filename);
            $obj->file($file);
            $data[$type] = $obj;
        } else {
            throw new \RuntimeException("Data type '{$type}' doesn't exist!");
        }

        return $data[$type];
    }

    /**
     * Get the GPM instance
     *
     * @return GPM The GPM instance
     */
    public function gpm()
    {
        if (!$this->gpm) {
            try {
                $this->gpm = new GPM();
            } catch (\Exception $e) {
            }
        }

        return $this->gpm;
    }

    /**
     * Converts dot notation to array notation.
     *
     * @param  string $name
     *
     * @return string
     */
    public function field($name)
    {
        $path = explode('.', $name);

        return array_shift($path) . ($path ? '[' . implode('][', $path) . ']' : '');
    }

    /**
     * Get all routes.
     *
     * @param bool $unique
     *
     * @return array
     */
    public function routes($unique = false)
    {
        /** @var Pages $pages */
        $pages = $this->grav['pages'];

        if ($unique) {
            $routes = array_unique($pages->routes());
        } else {
            $routes = $pages->routes();
        }

        return $routes;
    }

    /**
     * Count the pages
     *
     * @return array
     */
    public function pagesCount()
    {
        if (!$this->pages_count) {
            $this->pages_count = count($this->grav['pages']->all());
        }

        return $this->pages_count;
    }

    /**
     * Get all template types
     *
     * @return array
     */
    public function types()
    {
        return Pages::types();
    }

    /**
     * Get all modular template types
     *
     * @return array
     */
    public function modularTypes()
    {
        return Pages::modularTypes();
    }

    /**
     * Get all access levels
     *
     * @return array
     */
    public function accessLevels()
    {
        if (method_exists($this->grav['pages'], 'accessLevels')) {
            return $this->grav['pages']->accessLevels();
        } else {
            return [];
        }
    }

    /**
     * Get all plugins.
     *
     * @param bool $local
     *
     * @return array
     */
    public function plugins($local = true)
    {
        $gpm = $this->gpm();

        if (!$gpm) {
            return false;
        }

        return $local ? $gpm->getInstalledPlugins() : $gpm->getRepositoryPlugins()->filter(function (
            $package,
            $slug
        ) use ($gpm) {
            return !$gpm->isPluginInstalled($slug);
        });
    }

    public function getPackageFromGPM($package_slug)
    {
        $package = $this->plugins(true)[$package_slug];
        if (!$package) {
            $package = $this->themes(true)[$package_slug];
        }

        return $package;
    }

    /**
     * Generate an array of dependencies for a package, used to generate a list of
     * packages that can be removed when removing a package.
     *
     * @param string $slug The package slug
     *
     * @return array|bool
     */
    public function dependenciesThatCanBeRemovedWhenRemoving($slug)
    {
        $gpm = $this->gpm();
        if (!$gpm) {
            return false;
        }

        $dependencies = [];

        $package = $this->getPackageFromGPM($slug);

        if ($package) {
            if ($package->dependencies) {
                foreach ($package->dependencies as $dependency) {
                    if (count($gpm->getPackagesThatDependOnPackage($dependency)) > 1) {
                        continue;
                    }

                    if (!in_array($dependency, $dependencies)) {
                        if (!in_array($dependency, ['admin', 'form', 'login', 'email'])) {
                            $dependencies[] = $dependency;
                        }
                    }
                }
            }
        }

        return $dependencies;
    }

    /**
     * Get list of packages that depend on the passed package slug
     *
     * @param string $slug The package slug
     *
     * @return array|bool
     */
    public function getPackagesThatDependOnPackage($slug)
    {
        $gpm = $this->gpm();
        if (!$gpm) {
            return false;
        }

        return $gpm->getPackagesThatDependOnPackage($slug);
    }

    /**
     * Check the passed packages list can be updated
     *
     * @param $packages
     *
     * @throws \Exception
     * @return bool
     */
    public function checkPackagesCanBeInstalled($packages)
    {
        $gpm = $this->gpm();
        if (!$gpm) {
            return false;
        }

        $this->gpm->checkPackagesCanBeInstalled($packages);

        return true;
    }

    /**
     * Get an array of dependencies needed to be installed or updated for a list of packages
     * to be installed.
     *
     * @param array $packages The packages slugs
     *
     * @return array|bool
     */
    public function getDependenciesNeededToInstall($packages)
    {
        $gpm = $this->gpm();
        if (!$gpm) {
            return false;
        }

        $dependencies = $this->gpm->getDependencies($packages);

        return $dependencies;
    }

    /**
     * Get all themes.
     *
     * @param bool $local
     *
     * @return array
     */
    public function themes($local = true)
    {
        $gpm = $this->gpm();

        if (!$gpm) {
            return false;
        }

        return $local ? $gpm->getInstalledThemes() : $gpm->getRepositoryThemes()->filter(function ($package, $slug) use
        (
            $gpm
        ) {
            return !$gpm->isThemeInstalled($slug);
        });
    }

    /**
     * Used by the Dashboard in the admin to display the X latest pages
     * that have been modified
     *
     * @param  integer $count number of pages to pull back
     *
     * @return array|null
     */
    public function latestPages($count = 10)
    {
        /** @var Pages $pages */
        $pages = $this->grav['pages'];

        $latest = [];

        if (is_null($pages->routes())) {
            return null;
        }

        foreach ($pages->routes() as $url => $path) {
            $page = $pages->dispatch($url, true);
            if ($page && $page->routable()) {
                $latest[$page->route()] = ['modified' => $page->modified(), 'page' => $page];
            }
        }

        // sort based on modified
        uasort($latest, function ($a, $b) {
            if ($a['modified'] == $b['modified']) {
                return 0;
            }

            return ($a['modified'] > $b['modified']) ? -1 : 1;
        });

        // build new array with just pages in it
        $list = [];
        foreach ($latest as $item) {
            $list[] = $item['page'];
        }

        return array_slice($list, 0, $count);
    }

    /**
     * Get log file for fatal errors.
     *
     * @return string
     */
    public function logEntry()
    {
        $file = File::instance($this->grav['locator']->findResource("log://{$this->route}.html"));
        $content = $file->content();

        return $content;
    }

    /**
     * Search in the logs when was the latest backup made
     *
     * @return array Array containing the latest backup information
     */
    public function lastBackup()
    {
        $file = JsonFile::instance($this->grav['locator']->findResource("log://backup.log"));
        $content = $file->content();
        if (empty($content)) {
            return [
                'days'        => '&infin;',
                'chart_fill'  => 100,
                'chart_empty' => 0
            ];
        }

        $backup = new \DateTime();
        $backup->setTimestamp($content['time']);
        $diff = $backup->diff(new \DateTime());

        $days = $diff->days;
        $chart_fill = $days > 30 ? 100 : round($days / 30 * 100);

        return [
            'days'        => $days,
            'chart_fill'  => $chart_fill,
            'chart_empty' => 100 - $chart_fill
        ];
    }

    /**
     * Returns the page creating it if it does not exist.
     *
     * @param $path
     *
     * @return Page
     */
    public function getPage($path)
    {
        /** @var Pages $pages */
        $pages = $this->grav['pages'];

        if ($path && $path[0] != '/') {
            $path = "/{$path}";
        }

        $page = $path ? $pages->dispatch($path, true) : $pages->root();

        if (!$page) {
            $slug = basename($path);

            if ($slug == '') {
                return null;
            }

            $ppath = str_replace('\\', '/', dirname($path));

            // Find or create parent(s).
            $parent = $this->getPage($ppath != '/' ? $ppath : '');

            // Create page.
            $page = new Page;
            $page->parent($parent);
            $page->filePath($parent->path() . '/' . $slug . '/' . $page->name());

            // Add routing information.
            $pages->addPage($page, $path);

            // Set if Modular
            $page->modularTwig($slug[0] == '_');

            // Determine page type.
            if (isset($this->session->{$page->route()})) {
                // Found the type and header from the session.
                $data = $this->session->{$page->route()};

                $header = ['title' => $data['title']];

                if (isset($data['visible'])) {
                    if ($data['visible'] == '' || $data['visible']) {
                        // if auto (ie '')
                        $children = $page->parent()->children();
                        foreach ($children as $child) {
                            if ($child->order()) {
                                // set page order
                                $page->order(1000);
                                break;
                            }
                        }
                    }
                    if ($data['visible'] == 1 && !$page->order()) {
                        $header['visible'] = $data['visible'];
                    }

                }

                if ($data['name'] == 'modular') {
                    $header['body_classes'] = 'modular';
                }

                $name = $page->modular() ? str_replace('modular/', '', $data['name']) : $data['name'];
                $page->name($name . '.md');
                $page->header($header);
                $page->frontmatter(Yaml::dump((array)$page->header(), 10, 2, false));
            } else {
                // Find out the type by looking at the parent.
                $type = $parent->childType() ? $parent->childType() : $parent->blueprints()->get('child_type',
                    'default');
                $page->name($type . CONTENT_EXT);
                $page->header();
            }
            $page->modularTwig($slug[0] == '_');
        }

        return $page;
    }

    /**
     * Return the languages available in the admin
     *
     * @return array
     */
    public static function adminLanguages()
    {
        $languages = [];

        $path = Grav::instance()['locator']->findResource('plugins://admin/languages');

        /** @var \DirectoryIterator $directory */
        foreach (new \DirectoryIterator($path) as $file) {
            if ($file->isDir() || $file->isDot() || Utils::startsWith($file->getBasename(), '.')) {
                continue;
            }

            $lang = basename($file->getBasename(), '.yaml');

            $languages[$lang] = LanguageCodes::getNativeName($lang);

        }

        return $languages;
    }

    /**
     * Return the found configuration blueprints
     *
     * @return array
     */
    public static function configurations()
    {
        $configurations = [];

        /** @var UniformResourceIterator $iterator */
        $iterator = Grav::instance()['locator']->getIterator('blueprints://config');

        foreach ($iterator as $file) {
            if ($file->isDir() || !preg_match('/^[^.].*.yaml$/', $file->getFilename())) {
                continue;
            }
            $configurations[] = basename($file->getBasename(), '.yaml');
        }

        return $configurations;
    }

    /**
     * Return the languages available in the site
     *
     * @return array
     */
    public static function siteLanguages()
    {
        $languages = [];
        $lang_data = Grav::instance()['config']->get('system.languages.supported', []);

        foreach ($lang_data as $index => $lang) {
            $languages[$lang] = LanguageCodes::getNativeName($lang);
        }

        return $languages;
    }

    /**
     * Static helper method to return current route.
     *
     * @return string
     */
    public static function route()
    {
        $pages = Grav::instance()['pages'];
        $route = '/' . ltrim(Grav::instance()['admin']->route, '/');

        /** @var Page $page */
        $page = $pages->dispatch($route);
        $parent_route = null;
        if ($page) {
            $parent = $page->parent();
            $parent_route = $parent->rawRoute();
        }

        return $parent_route;
    }

    /**
     * Static helper method to return the admin form nonce
     *
     * @return string
     */
    public static function getNonce()
    {
        $action = 'admin-form';

        return Utils::getNonce($action);
    }

    /**
     * Static helper method to return the last used page name
     *
     * @return string
     */
    public static function getLastPageName()
    {
        return Grav::instance()['session']->lastPageName ?: 'default';
    }

    /**
     * Static helper method to return the last used page route
     *
     * @return string
     */
    public static function getLastPageRoute()
    {
        return Grav::instance()['session']->lastPageRoute ?: self::route();
    }

    /**
     * Determine if the plugin or theme info passed is from Team Grav
     *
     * @param object $info Plugin or Theme info object
     *
     * @return bool
     */
    public function isTeamGrav($info)
    {
        if (isset($info['author']['name']) && $info['author']['name'] == 'Team Grav') {
            return true;
        } else {
            return false;
        }
    }

    /**
     * Renders phpinfo
     *
     * @return string The phpinfo() output
     */
    function phpinfo()
    {
        if (function_exists('phpinfo')) {
            ob_start();
            phpinfo();
            $pinfo = ob_get_contents();
            ob_end_clean();

            $pinfo = preg_replace('%^.*<body>(.*)</body>.*$%ms', '$1', $pinfo);

            return $pinfo;
        } else {
            return 'phpinfo() method is not available on this server.';
        }
    }

    /**
     * Translate a string to the user-defined language
     *
     * @param array|mixed $args
     *
     * @param mixed       $languages
     *
     * @return string
     */
    public function translate($args, $languages = null)
    {
        if (is_array($args)) {
            $lookup = array_shift($args);
        } else {
            $lookup = $args;
            $args = [];
        }

        if (!$languages) {
            $languages = [$this->grav['user']->authenticated ? $this->grav['user']->language : 'en'];
        } else {
            $languages = (array)$languages;
        }


        if ($lookup) {
            if (empty($languages) || reset($languages) == null) {
                if ($this->grav['config']->get('system.languages.translations_fallback', true)) {
                    $languages = $this->grav['language']->getFallbackLanguages();
                } else {
                    $languages = (array)$this->grav['language']->getDefault();
                }
            }
        }

        foreach ((array)$languages as $lang) {
            $translation = $this->grav['language']->getTranslation($lang, $lookup);

            if (!$translation) {
                $language = $this->grav['language']->getDefault() ?: 'en';
                $translation = $this->grav['language']->getTranslation($language, $lookup);
            }

            if (!$translation) {
                $language = 'en';
                $translation = $this->grav['language']->getTranslation($language, $lookup);
            }

            if ($translation) {
                if (count($args) >= 1) {
                    return vsprintf($translation, $args);
                } else {
                    return $translation;
                }
            }
        }

        return $lookup;
    }

    /**
     * Guest date format based on euro/US
     *
     * @param $date
     *
     * @return string
     */
    public function guessDateFormat($date)
    {
        static $guess;

        if (!isset($guess[$date])) {
            if (Utils::contains($date, '/')) {
                if ($this->validateDate($date, 'm/d/Y H:i')) {
                    $guess[$date] = 'm/d/Y H:i';
                } elseif ($this->validateDate($date, 'm/d/y H:i')) {
                    $guess[$date] = 'm/d/y H:i';
                } elseif ($this->validateDate($date, 'm/d/Y G:i')) {
                    $guess[$date] = 'm/d/Y G:i';
                } elseif ($this->validateDate($date, 'm/d/y G:i')) {
                    $guess[$date] = 'm/d/y G:i';
                } elseif ($this->validateDate($date, 'm/d/Y h:ia')) {
                    $guess[$date] = 'm/d/Y h:ia';
                } elseif ($this->validateDate($date, 'm/d/y h:ia')) {
                    $guess[$date] = 'm/d/y h:ia';
                } elseif ($this->validateDate($date, 'm/d/Y g:ia')) {
                    $guess[$date] = 'm/d/Y g:ia';
                } elseif ($this->validateDate($date, 'm/d/y g:ia')) {
                    $guess[$date] = 'm/d/y g:ia';
                }
            } elseif (Utils::contains($date, '-')) {
                if ($this->validateDate($date, 'd-m-Y H:i')) {
                    $guess[$date] = 'd-m-Y H:i';
                } elseif ($this->validateDate($date, 'd-m-y H:i')) {
                    $guess[$date] = 'd-m-y H:i';
                } elseif ($this->validateDate($date, 'd-m-Y G:i')) {
                    $guess[$date] = 'd-m-Y G:i';
                } elseif ($this->validateDate($date, 'd-m-y G:i')) {
                    $guess[$date] = 'd-m-y G:i';
                } elseif ($this->validateDate($date, 'd-m-Y h:ia')) {
                    $guess[$date] = 'd-m-Y h:ia';
                } elseif ($this->validateDate($date, 'd-m-y h:ia')) {
                    $guess[$date] = 'd-m-y h:ia';
                } elseif ($this->validateDate($date, 'd-m-Y g:ia')) {
                    $guess[$date] = 'd-m-Y g:ia';
                } elseif ($this->validateDate($date, 'd-m-y g:ia')) {
                    $guess[$date] = 'd-m-y g:ia';
                }
            } else {
                $guess[$date] = 'd-m-Y H:i';
            }
        }

        return $guess[$date];
    }

    public function validateDate($date, $format)
    {
        $d = DateTime::createFromFormat($format, $date);

        return $d && $d->format($format) == $date;
    }

    /**
     * @param string $php_format
     *
     * @return string
     */
    public function dateformatToMomentJS($php_format)
    {
        $SYMBOLS_MATCHING = [
            // Day
            'd' => 'DD',
            'D' => 'ddd',
            'j' => 'D',
            'l' => 'dddd',
            'N' => 'E',
            'S' => 'Do',
            'w' => 'd',
            'z' => 'DDD',
            // Week
            'W' => 'W',
            // Month
            'F' => 'MMMM',
            'm' => 'MM',
            'M' => 'MMM',
            'n' => 'M',
            't' => '',
            // Year
            'L' => '',
            'o' => 'GGGG',
            'Y' => 'YYYY',
            'y' => 'yy',
            // Time
            'a' => 'a',
            'A' => 'A',
            'B' => 'SSS',
            'g' => 'h',
            'G' => 'H',
            'h' => 'hh',
            'H' => 'HH',
            'i' => 'mm',
            's' => 'ss',
            'u' => '',
            // Timezone
            'e' => '',
            'I' => '',
            'O' => 'ZZ',
            'P' => 'Z',
            'T' => 'z',
            'Z' => '',
            // Full Date/Time
            'c' => '',
            'r' => 'llll ZZ',
            'U' => 'X'
        ];
        $js_format = "";
        $escaping = false;
        for ($i = 0; $i < strlen($php_format); $i++) {
            $char = $php_format[$i];
            if ($char === '\\') // PHP date format escaping character
            {
                $i++;
                if ($escaping) {
                    $js_format .= $php_format[$i];
                } else {
                    $js_format .= '\'' . $php_format[$i];
                }
                $escaping = true;
            } else {
                if ($escaping) {
                    $js_format .= "'";
                    $escaping = false;
                }
                if (isset($SYMBOLS_MATCHING[$char])) {
                    $js_format .= $SYMBOLS_MATCHING[$char];
                } else {
                    $js_format .= $char;
                }
            }
        }

        return $js_format;
    }

    /**
     * Sets the entire permissions array
     *
     * @param $permissions
     */
    public function setPermissions($permissions)
    {
        $this->permissions = $permissions;
    }

    /**
     * Gets the entire permissions array
     *
     * @return Array
     */
    public function getPermissions()
    {
        return $this->permissions;
    }

    /**
     * Adds a permission to the permissions array
     *
     * @param $permissions
     */
    public function addPermissions($permissions)
    {
        $this->permissions = array_merge($this->permissions, $permissions);
    }

    public function findFormFields($type, $fields, $found_fields = [])
    {
        foreach ($fields as $key => $field) {

            if (isset($field['type']) && $field['type'] == $type) {
                $found_fields[$key] = $field;
            } elseif (isset($field['fields'])) {
                $result = $this->findFormFields($type, $field['fields'], $found_fields);
                if (!empty($result)) {
                    $found_fields = array_merge($found_fields, $result);
                }
            }
        }

        return $found_fields;
    }

    public function getPagePathFromToken($path)
    {
        $path_parts = pathinfo($path);

        $basename = '';
        if (isset($path_parts['extension'])) {
            $basename = '/' . $path_parts['basename'];
            $path = $path_parts['dirname'];
        }

        $regex = '/(@self|self@)|((?:@page|page@):(?:.*))|((?:@theme|theme@):(?:.*))/';
        preg_match($regex, $path, $matches);

        if ($matches) {
            if ($matches[1]) {
                // self@
                $page = $this->page(true);
            } elseif ($matches[2]) {
                // page@
                $parts = explode(':', $path);
                $route = $parts[1];
                $page = $this->grav['page']->find($route);
            } elseif ($matches[3]) {
                // theme@
                $parts = explode(':', $path);
                $route = $parts[1];
                $theme = str_replace(ROOT_DIR, '', $this->grav['locator']->findResource("theme://"));

                return $theme . $route . $basename;
            }
        } else {
            return $path . $basename;
        }

        if (!$page) {
            throw new \RuntimeException('Page route not found: ' . $path);
        }

        $path = str_replace($matches[0], rtrim($page->relativePagePath(), '/'), $path);

        return $path . $basename;
    }

}
