<?php
namespace Grav\Plugin;

use Grav\Common\Cache;
use Grav\Common\Config\Config;
use Grav\Common\Filesystem\Folder;
use Grav\Common\GPM\Installer;
use Grav\Common\Grav;
use Grav\Common\Themes;
use Grav\Common\Uri;
use Grav\Common\Data;
use Grav\Common\Page;
use Grav\Common\Page\Collection;
use Grav\Common\User\User;
use Grav\Common\Utils;
use Grav\Common\Backup\ZipBackup;
use Grav\Common\Markdown\Parsedown;
use Grav\Common\Markdown\ParsedownExtra;
use RocketTheme\Toolbox\File\File;
use RocketTheme\Toolbox\File\JsonFile;
use Symfony\Component\Yaml\Yaml;

class AdminController
{
    /**
     * @var Grav
     */
    public $grav;

    /**
     * @var string
     */
    public $view;

    /**
     * @var string
     */
    public $task;

    /**
     * @var string
     */
    public $route;

    /**
     * @var array
     */
    public $post;

    /**
     * @var Admin
     */
    protected $admin;

    /**
     * @var string
     */
    protected $redirect;

    /**
     * @var int
     */
    protected $redirectCode;

    /**
     * @param Grav   $grav
     * @param string $view
     * @param string $task
     * @param string $route
     * @param array  $post
     */
    public function __construct(Grav $grav, $view, $task, $route, $post)
    {
        $this->grav = $grav;
        $this->view = $view;
        $this->task = $task ? $task : 'display';
        $this->post = $this->getPost($post);
        $this->route = $route;
        $this->admin = $this->grav['admin'];
    }

    /**
     * Performs a task.
     *
     * @return bool True if the action was performed successfully.
     */
    public function execute()
    {
        $success = false;
        $method = 'task' . ucfirst($this->task);
        if (method_exists($this, $method)) {
            try {
                $success = call_user_func(array($this, $method));
            } catch (\RuntimeException $e) {
                $success = true;
                $this->admin->setMessage($e->getMessage(), 'error');
            }

            // Grab redirect parameter.
            $redirect = isset($this->post['_redirect']) ? $this->post['_redirect'] : null;
            unset($this->post['_redirect']);

            // Redirect if requested.
            if ($redirect) {
                $this->setRedirect($redirect);
            }
        }
        return $success;
    }

    /**
     * Redirect to the route stored in $this->redirect
     */
    public function redirect()
    {
        if (!$this->redirect) {
            return;
        }

        $base = $this->admin->base;
        $this->redirect = '/' . ltrim($this->redirect, '/');
        $multilang = $this->isMultilang();

        $redirect = '';
        if ($multilang) {
            // if base path does not already contain the lang code, add it
            $langPrefix = '/' . $this->grav['session']->admin_lang;
            if (!Utils::startsWith($base, $langPrefix . '/')) {
                $base = $langPrefix . $base;
            }

            // now the first 4 chars of base contain the lang code.
            // if redirect path already contains the lang code, and is != than the base lang code, then use redirect path as-is
            if (Utils::pathPrefixedByLangCode($base) &&
                Utils::pathPrefixedByLangCode($this->redirect) &&
                substr($base, 0, 4) != substr($this->redirect, 0, 4)) {
                    $redirect = $this->redirect;
            } else {
                if (!Utils::startsWith($this->redirect, $base)) {
                    $this->redirect = $base . $this->redirect;
                }
            }

        } else {
            if (!Utils::startsWith($this->redirect, $base)) {
                $this->redirect = $base . $this->redirect;
            }
        }

        if (!$redirect) {
            $redirect = $this->redirect;
        }

        $this->grav->redirect($redirect, $this->redirectCode);
    }

    /**
     * Return true if multilang is active
     *
     * @return bool True if multilang is active
     */
    protected function isMultilang() {
        return count($this->grav['config']->get('system.languages.supported', [])) > 1;
    }

    /**
     * Handle login.
     *
     * @return bool True if the action was performed.
     */
    protected function taskLogin()
    {
        if ($this->admin->authenticate($this->post)) {
            // should never reach here, redirects first
        } else {
            $this->admin->setMessage($this->admin->translate('PLUGIN_ADMIN.LOGIN_FAILED'), 'error');
        }

        return true;
    }

    /**
     * Handle logout.
     *
     * @return bool True if the action was performed.
     */
    protected function taskLogout()
    {
        $this->admin->session()->invalidate()->start();
        $this->admin->setMessage($this->admin->translate('PLUGIN_ADMIN.LOGGED_OUT'), 'info');
        $this->setRedirect('/logout');

        return true;
    }

    /**
     * Handle logout.
     *
     * @return bool True if the action was performed.
     */
    protected function taskKeepAlive()
    {
        exit();
    }

    /**
     * Handle the email password recovery procedure.
     *
     * @return bool True if the action was performed.
     */
    protected function taskForgot()
    {
        $param_sep = $this->grav['config']->get('system.param_sep', ':');
        $data = $this->post;

        $username = isset($data['username']) ? $data['username'] : '';
        $user = !empty($username) ? User::load($username) : null;

        if (!isset($this->grav['Email'])) {
            $this->admin->setMessage($this->admin->translate('PLUGIN_ADMIN.FORGOT_EMAIL_NOT_CONFIGURED'), 'error');
            $this->setRedirect('/');
            return true;
        }

        if (!$user || !$user->exists()) {
            $this->admin->setMessage($this->admin->translate(['PLUGIN_ADMIN.FORGOT_USERNAME_DOES_NOT_EXIST', $username]), 'error');
            $this->setRedirect('/forgot');
            return true;
        }

        if (empty($user->email)) {
            $this->admin->setMessage($this->admin->translate(['PLUGIN_ADMIN.FORGOT_CANNOT_RESET_EMAIL_NO_EMAIL', $username]), 'error');
            $this->setRedirect('/forgot');
            return true;
        }

        $token = md5(uniqid(mt_rand(), true));
        $expire = time() + 604800; // next week

        $user->reset = $token . '::' . $expire;
        $user->save();

        $author = $this->grav['config']->get('site.author.name', '');
        $fullname = $user->fullname ?: $username;
        $reset_link = rtrim($this->grav['uri']->rootUrl(true), '/') . '/' . trim($this->admin->base, '/') . '/reset/task' . $param_sep . 'reset/user'. $param_sep . $username . '/token' . $param_sep . $token;

        $sitename = $this->grav['config']->get('site.title', 'Website');
        $from = $this->grav['config']->get('plugins.email.from', 'noreply@getgrav.org');
        $to = $user->email;

        $subject = $this->admin->translate(['PLUGIN_ADMIN.FORGOT_EMAIL_SUBJECT', $sitename]);
        $content = $this->admin->translate(['PLUGIN_ADMIN.FORGOT_EMAIL_BODY', $fullname, $reset_link, $author, $sitename]);

        $body = $this->grav['twig']->processTemplate('email/base.html.twig', ['content' => $content]);

        $message = $this->grav['Email']->message($subject, $body, 'text/html')
            ->setFrom($from)
            ->setTo($to);

        $sent = $this->grav['Email']->send($message);

        if ($sent < 1) {
            $this->admin->setMessage($this->admin->translate('PLUGIN_ADMIN.FORGOT_FAILED_TO_EMAIL'), 'error');
        } else {
            $this->admin->setMessage($this->admin->translate(['PLUGIN_ADMIN.FORGOT_INSTRUCTIONS_SENT_VIA_EMAIL', $to]), 'info');
        }

        $this->setRedirect('/');
        return true;
    }

    /**
     * Handle the reset password action.
     *
     * @return bool True if the action was performed.
     */
    public function taskReset()
    {
        $data = $this->post;

        if (isset($data['password'])) {
            $username = isset($data['username']) ? $data['username'] : null;
            $user = !empty($username) ? User::load($username) : null;
            $password = isset($data['password']) ? $data['password'] : null;
            $token = isset($data['token']) ? $data['token'] : null;

            if (!empty($user) && $user->exists() && !empty($user->reset)) {
                list($good_token, $expire) = explode('::', $user->reset);

                if ($good_token === $token) {
                    if (time() > $expire) {
                        $this->admin->setMessage($this->admin->translate('PLUGIN_ADMIN.RESET_LINK_EXPIRED'), 'error');
                        $this->setRedirect('/forgot');
                        return true;
                    }

                    unset($user->hashed_password);
                    unset($user->reset);
                    $user->password = $password;

                    $user->validate();
                    $user->filter();
                    $user->save();

                    $this->admin->setMessage($this->admin->translate('PLUGIN_ADMIN.RESET_PASSWORD_RESET'), 'info');
                    $this->setRedirect('/');
                    return true;
                }
            }

            $this->admin->setMessage($this->admin->translate('PLUGIN_ADMIN.RESET_INVALID_LINK'), 'error');
            $this->setRedirect('/forgot');
            return true;

        } else {
            $user = $this->grav['uri']->param('user');
            $token = $this->grav['uri']->param('token');

            if (empty($user) || empty($token)) {
                $this->admin->setMessage($this->admin->translate('PLUGIN_ADMIN.RESET_INVALID_LINK'), 'error');
                $this->setRedirect('/forgot');
                return true;
            }

            $this->admin->forgot = [ 'username' => $user, 'token' => $token ];
        }

        return true;
    }

    /**
     * Clear the cache.
     *
     * @return bool True if the action was performed.
     */
    protected function taskClearCache()
    {
        if (!$this->authorizeTask('clear cache', ['admin.cache', 'admin.super'])) {
            return;
        }

        // get optional cleartype param
        $clear_type = $this->grav['uri']->param('cleartype');

        if ($clear_type) {
            $clear = $clear_type;
        } else {
            $clear = 'standard';
        }

        $results = Cache::clearCache($clear);
        if (count($results) > 0) {
            $this->admin->json_response = ['status' => 'success', 'message' => $this->admin->translate('PLUGIN_ADMIN.CACHE_CLEARED') . ' <br />' . $this->admin->translate('PLUGIN_ADMIN.METHOD') . ': ' . $clear . ''];
        } else {
            $this->admin->json_response = ['status' => 'error', 'message' => $this->admin->translate('PLUGIN_ADMIN.ERROR_CLEARING_CACHE')];
        }

        return true;
    }

    /**
     * Handle the backup action
     *
     * @return bool True if the action was performed.
     */
    protected function taskBackup()
    {
        $param_sep = $this->grav['config']->get('system.param_sep', ':');
        if (!$this->authorizeTask('backup', ['admin.maintenance', 'admin.super'])) {
            return;
        }

        $download = $this->grav['uri']->param('download');

        if ($download) {
            Utils::download(base64_decode(urldecode($download)), true);
        }

        $log = JsonFile::instance($this->grav['locator']->findResource("log://backup.log", true, true));

        try {
            $backup = ZipBackup::backup();
        } catch (\Exception $e) {
            $this->admin->json_response = [
                'status' => 'error',
                'message' => $this->admin->translate('PLUGIN_ADMIN.AN_ERROR_OCCURRED') . '. '.  $e->getMessage()
            ];

            return true;
        }

        $download = urlencode(base64_encode($backup));
        $url = rtrim($this->grav['uri']->rootUrl(true), '/') . '/' . trim($this->admin->base, '/') . '/task' . $param_sep . 'backup/download' . $param_sep . $download;

        $log->content([
            'time' => time(),
            'location' => $backup
        ]);
        $log->save();

        $this->admin->json_response = [
            'status' => 'success',
            'message' => $this->admin->translate('PLUGIN_ADMIN.YOUR_BACKUP_IS_READY_FOR_DOWNLOAD') . '. <a href="'.$url.'" class="button">' . $this->admin->translate('PLUGIN_ADMIN.DOWNLOAD_BACKUP') .'</a>',
            'toastr' => [
                'timeOut' => 0,
                'closeButton' => true
            ]
        ];

        return true;
    }

    /**
     * Handles filtering the page by modular/visible/routable in the pages list.
     */
    protected function taskFilterPages()
    {
        if (!$this->authorizeTask('filter pages', ['admin.pages', 'admin.super'])) {
            return;
        }

        $data = $this->post;

        $flags = !empty($data['flags']) ? array_map('strtolower', explode(',', $data['flags'])) : [];
        $queries = !empty($data['query']) ? explode(',', $data['query']) : [];

        /** @var Collection $collection */
        $collection = $this->grav['pages']->all();

        if (count($flags)) {
            // Filter by state
            $pageStates = array('modular', 'nonmodular', 'visible', 'nonvisible', 'routable', 'nonroutable', 'published', 'nonpublished');

            if (count(array_intersect($pageStates, $flags)) > 0) {
                if (in_array('modular', $flags))
                    $collection = $collection->modular();

                if (in_array('nonmodular', $flags))
                    $collection = $collection->nonModular();

                if (in_array('visible', $flags))
                    $collection = $collection->visible();

                if (in_array('nonvisible', $flags))
                    $collection = $collection->nonVisible();

                if (in_array('routable', $flags))
                    $collection = $collection->routable();

                if (in_array('nonroutable', $flags))
                    $collection = $collection->nonRoutable();

                if (in_array('published', $flags))
                    $collection = $collection->published();

                if (in_array('nonpublished', $flags))
                    $collection = $collection->nonPublished();
            }
            foreach ($pageStates as $pageState) {
                if (($pageState = array_search($pageState, $flags)) !== false) {
                    unset($flags[$pageState]);
                }
            }

            // Filter by page type
            if (count($flags)) {
                $types = $flags;
                $collection = $collection->ofOneOfTheseTypes($types);
            }
        }

        if (!empty($queries)) {
            foreach ($collection as $page) {
                foreach ($queries as $query) {
                    $query = trim($query);

                    // $page->content();
                    if (stripos($page->getRawContent(), $query) === false && stripos($page->title(), $query) === false) {
                        $collection->remove($page);
                    }
                }
            }
        }

        $results = [];
        foreach ($collection as $path => $page) {
            $results[] = $page->route();
        }

        $this->admin->json_response = [
            'status' => 'success',
            'message' => $this->admin->translate('PLUGIN_ADMIN.PAGES_FILTERED'),
            'results' => $results
        ];
        $this->admin->collection = $collection;
    }

    /**
     * Determines the file types allowed to be uploaded
     *
     * @return bool True if the action was performed.
     */
    protected function taskListmedia()
    {
        if (!$this->authorizeTask('list media', ['admin.pages', 'admin.super'])) {
            return;
        }

        $page = $this->admin->page(true);

        if (!$page) {
            $this->admin->json_response = ['status' => 'error', 'message' => $this->admin->translate('PLUGIN_ADMIN.NO_PAGE_FOUND')];
            return false;
        }

        $media_list = array();
        foreach ($page->media()->all() as $name => $media) {
            $media_list[$name] = ['url' => $media->cropZoom(150, 100)->url(), 'size' => $media->get('size')];
        }
        $this->admin->json_response = ['status' => 'ok', 'results' => $media_list];

        return true;
    }

    /**
     * Handles adding a media file to a page
     */
    protected function taskAddmedia()
    {
        if (!$this->authorizeTask('add media', ['admin.pages', 'admin.super'])) {
            return;
        }

        $page = $this->admin->page(true);

        /** @var Config $config */
        $config = $this->grav['config'];

        if (!isset($_FILES['file']['error']) || is_array($_FILES['file']['error'])) {
            $this->admin->json_response = ['status' => 'error', 'message' => $this->admin->translate('PLUGIN_ADMIN.INVALID_PARAMETERS')];
            return;
        }

        // Check $_FILES['file']['error'] value.
        switch ($_FILES['file']['error']) {
            case UPLOAD_ERR_OK:
                break;
            case UPLOAD_ERR_NO_FILE:
                $this->admin->json_response = ['status' => 'error', 'message' => $this->admin->translate('PLUGIN_ADMIN.NO_FILES_SENT')];
                return;
            case UPLOAD_ERR_INI_SIZE:
            case UPLOAD_ERR_FORM_SIZE:
                $this->admin->json_response = ['status' => 'error', 'message' => $this->admin->translate('PLUGIN_ADMIN.EXCEEDED_FILESIZE_LIMIT')];
                return;
            default:
                $this->admin->json_response = ['status' => 'error', 'message' => $this->admin->translate('PLUGIN_ADMIN.UNKNOWN_ERRORS')];
                return;
        }

        $grav_limit = $config->get('system.media.upload_limit', 0);
        // You should also check filesize here.
        if ($grav_limit > 0 && $_FILES['file']['size'] > $grav_limit) {
            $this->admin->json_response = ['status' => 'error', 'message' => $this->admin->translate('PLUGIN_ADMIN.EXCEEDED_GRAV_FILESIZE_LIMIT')];
            return;
        }


        // Check extension
        $fileParts = pathinfo($_FILES['file']['name']);
        $fileExt = strtolower($fileParts['extension']);

        // If not a supported type, return
        if (!$config->get("media.{$fileExt}")) {
            $this->admin->json_response = ['status' => 'error', 'message' => $this->admin->translate('PLUGIN_ADMIN.UNSUPPORTED_FILE_TYPE') . ': '.$fileExt];
            return;
        }


        // Upload it
        if (!move_uploaded_file($_FILES['file']['tmp_name'], sprintf('%s/%s', $page->path(), $_FILES['file']['name']))) {
            $this->admin->json_response = ['status' => 'error', 'message' => $this->admin->translate('PLUGIN_ADMIN.FAILED_TO_MOVE_UPLOADED_FILE')];
            return;
        }

        $this->admin->json_response = ['status' => 'success', 'message' => $this->admin->translate('PLUGIN_ADMIN.FILE_UPLOADED_SUCCESSFULLY')];

        return;
    }

    /**
     * Handles deleting a media file from a page
     *
     * @return bool True if the action was performed.
     */
    protected function taskDelmedia()
    {
        if (!$this->authorizeTask('delete media', ['admin.pages', 'admin.super'])) {
            return;
        }

        $page = $this->admin->page(true);

        if (!$page) {
            $this->admin->json_response = ['status' => 'error', 'message' => $this->admin->translate('PLUGIN_ADMIN.NO_PAGE_FOUND')];
            return false;
        }

        $filename = !empty($this->post['filename']) ? $this->post['filename'] : null;
        if ($filename) {
            $targetPath = $page->path().'/'.$filename;

            if (file_exists($targetPath)) {
                if (unlink($targetPath)) {
                    $this->admin->json_response = ['status' => 'success', 'message' => $this->admin->translate('PLUGIN_ADMIN.FILE_DELETED') . ': '.$filename];
                } else {
                    $this->admin->json_response = ['status' => 'error', 'message' => $this->admin->translate('PLUGIN_ADMIN.FILE_COULD_NOT_BE_DELETED') . ': '.$filename];
                }
            } else {
                //Try with responsive images @1x, @2x, @3x
                $ext = pathinfo($targetPath, PATHINFO_EXTENSION);
                $filename = $page->path() . '/'. basename($targetPath, ".$ext");
                $responsiveTargetPath = $filename . '@1x.' . $ext;
                $deletedResponsiveImage = false;
                if (file_exists($responsiveTargetPath) && unlink($responsiveTargetPath)) {
                    $deletedResponsiveImage = true;
                }

                $responsiveTargetPath = $filename . '@2x.' . $ext;
                if (file_exists($responsiveTargetPath) && unlink($responsiveTargetPath)) {
                    $deletedResponsiveImage = true;
                }
                $responsiveTargetPath = $filename . '@3x.' . $ext;
                if (file_exists($responsiveTargetPath) && unlink($responsiveTargetPath)) {
                    $deletedResponsiveImage = true;
                }

                if ($deletedResponsiveImage) {
                    $this->admin->json_response = ['status' => 'success', 'message' => $this->admin->translate('PLUGIN_ADMIN.FILE_DELETED') . ': '.$filename];
                } else {
                    $this->admin->json_response = ['status' => 'error', 'message' => $this->admin->translate('PLUGIN_ADMIN.FILE_NOT_FOUND') . ': '.$filename];
                }

            }
        } else {
            $this->admin->json_response = ['status' => 'error', 'message' => $this->admin->translate('PLUGIN_ADMIN.NO_FILE_FOUND')];
        }

        return true;
    }

    /**
     * Process the page Markdown
     */
    protected function taskProcessMarkdown()
    {
//        if (!$this->authorizeTask('process markdown', ['admin.pages', 'admin.super'])) {
//            return;
//        }

        try {
            $page = $this->admin->page(true);

            if (!$page) {
                $this->admin->json_response = ['status' => 'error', 'message' => $this->admin->translate('PLUGIN_ADMIN.NO_PAGE_FOUND')];
                return false;
            }

            $this->preparePage($page, true);
            $page->header();

            // Add theme template paths to Twig loader
            $template_paths = $this->grav['locator']->findResources('theme://templates');
            $loader_chain = $this->grav['twig']->twig->getLoader()->addLoader(new \Twig_Loader_Filesystem($template_paths));

            $html = $page->content();

            $this->admin->json_response = ['status' => 'success', 'message' => $html];
            return true;
        } catch (\Exception $e) {
            $this->admin->json_response = ['status' => 'error', 'message' => $e->getMessage()];
            return false;
        }
    }

    /**
     * Enable a plugin.
     *
     * @return bool True if the action was performed.
     */
    public function taskEnable()
    {
        if (!$this->authorizeTask('enable plugin', ['admin.plugins', 'admin.super'])) {
            return;
        }

        if ($this->view != 'plugins') {
            return false;
        }

        // Filter value and save it.
        $this->post = array('enabled' => 1, '_redirect' => 'plugins');
        $obj = $this->prepareData();
        $obj->save();
        $this->admin->setMessage($this->admin->translate('PLUGIN_ADMIN.SUCCESSFULLY_ENABLED_PLUGIN'), 'info');

        return true;
    }

    /**
     * Disable a plugin.
     *
     * @return bool True if the action was performed.
     */
    public function taskDisable()
    {
        if (!$this->authorizeTask('disable plugin', ['admin.plugins', 'admin.super'])) {
            return;
        }

        if ($this->view != 'plugins') {
            return false;
        }

        // Filter value and save it.
        $this->post = array('enabled' => 0, '_redirect' => 'plugins');
        $obj = $this->prepareData();
        $obj->save();
        $this->admin->setMessage($this->admin->translate('PLUGIN_ADMIN.SUCCESSFULLY_DISABLED_PLUGIN'), 'info');

        return true;
    }

    /**
     * Set the default theme.
     *
     * @return bool True if the action was performed.
     */
    public function taskActivate()
    {
        if (!$this->authorizeTask('activate theme', ['admin.themes', 'admin.super'])) {
            return;
        }

        if ($this->view != 'themes') {
            return false;
        }

        $this->post = array('_redirect' => 'themes');

        // Make sure theme exists (throws exception)
        $name = $this->route;
        $this->grav['themes']->get($name);

        // Store system configuration.
        $system = $this->admin->data('system');
        $system->set('pages.theme', $name);
        $system->save();

        // Force configuration reload and save.
        /** @var Config $config */
        $config = $this->grav['config'];
        $config->reload()->save();

        $config->set('system.pages.theme', $name);

        $this->admin->setMessage($this->admin->translate('PLUGIN_ADMIN.SUCCESSFULLY_CHANGED_THEME'), 'info');

        return true;
    }

    /**
     * Handles installing plugins and themes
     *
     * @return bool True is the action was performed
     */
    public function taskInstall()
    {
        $type = $this->view === 'plugins' ? 'plugins' : 'themes';
        if (!$this->authorizeTask('install ' . $type, ['admin.' . $type, 'admin.super'])) {
            return;
        }

        require_once __DIR__ . '/gpm.php';

        $package = $this->route;

        $result = \Grav\Plugin\Admin\Gpm::install($package, ['theme' => ($type == 'themes')]);

        if ($result) {
            $this->admin->setMessage($this->admin->translate('PLUGIN_ADMIN.INSTALLATION_SUCCESSFUL'), 'info');
        } else {
            $this->admin->setMessage($this->admin->translate('PLUGIN_ADMIN.INSTALLATION_FAILED'), 'error');
        }

        $this->post = array('_redirect' => $this->view . '/' . $this->route);

        return true;
    }

    /**
     * Handles updating Grav
     *
     * @return bool True is the action was performed
     */
    public function taskUpdategrav()
    {
        require_once __DIR__ . '/gpm.php';

        if (!$this->authorizeTask('install grav', ['admin.super'])) {
            return;
        }

        $result = \Grav\Plugin\Admin\Gpm::selfupgrade();

        if ($result) {
            $this->admin->json_response = ['status' => 'success', 'message' => $this->admin->translate('PLUGIN_ADMIN.GRAV_WAS_SUCCESSFULLY_UPDATED_TO') . ' '];
        } else {
            $this->admin->json_response = ['status' => 'error', 'message' => $this->admin->translate('PLUGIN_ADMIN.GRAV_UPDATE_FAILED') . ' <br>' . Installer::lastErrorMsg()];
        }

        return true;
    }

    /**
     * Handles updating plugins and themes
     *
     * @return bool True is the action was performed
     */
    public function taskUpdate()
    {
        require_once __DIR__ . '/gpm.php';

        $package = $this->route;
        $permissions = [];

        $type = $this->view === 'plugins' ? 'plugins' : 'themes';

        // Update multi mode
        if (!$package) {
            $package = [];

            if ($this->view === 'plugins' || $this->view === 'update') {
                $package = $this->admin->gpm()->getUpdatablePlugins();
                $permissions['plugins'] = ['admin.super', 'admin.plugins'];
            }

            if ($this->view === 'themes' || $this->view === 'update') {
                $package = array_merge($package, $this->admin->gpm()->getUpdatableThemes());
                $permissions['themes'] = ['admin.super', 'admin.themes'];
            }
        }

        foreach ($permissions as $type => $p) {
            if (!$this->authorizeTask('update ' . $type , $p)) {
                return;
            }
        }

        $result = \Grav\Plugin\Admin\Gpm::update($package, ['theme' => ($type == 'themes')]);

        if ($this->view === 'update') {

            if ($result) {
                $this->admin->json_response = ['status' => 'success', 'message' => $this->admin->translate('PLUGIN_ADMIN.EVERYTHING_UPDATED')];
            } else {
                $this->admin->json_response = ['status' => 'error', 'message' => $this->admin->translate('PLUGIN_ADMIN.UPDATES_FAILED')];
            }

        } else {
            if ($result) {
                $this->admin->setMessage($this->admin->translate('PLUGIN_ADMIN.INSTALLATION_SUCCESSFUL'), 'info');
            } else {
                $this->admin->setMessage($this->admin->translate('PLUGIN_ADMIN.INSTALLATION_FAILED'), 'error');
            }

            $this->post = array('_redirect' => $this->view . '/' . $this->route);
        }

        return true;
    }

    /**
     * Handles uninstalling plugins and themes
     *
     * @return bool True is the action was performed
     */
    public function taskUninstall()
    {
        $type = $this->view === 'plugins' ? 'plugins' : 'themes';
        if (!$this->authorizeTask('uninstall ' . $type, ['admin.' . $type, 'admin.super'])) {
            return;
        }

        require_once __DIR__ . '/gpm.php';

        $package = $this->route;

        $result = \Grav\Plugin\Admin\Gpm::uninstall($package, []);

        if ($result) {
            $this->admin->setMessage($this->admin->translate('PLUGIN_ADMIN.UNINSTALL_SUCCESSFUL'), 'info');
        } else {
            $this->admin->setMessage($this->admin->translate('PLUGIN_ADMIN.UNINSTALL_FAILED'), 'error');
        }

        $this->post = array('_redirect' => $this->view);

        return true;
    }

    /**
     * Handles form and saves the input data if its valid.
     *
     * @return bool True if the action was performed.
     */
    public function taskSave()
    {
        if (!$this->authorizeTask('save', $this->dataPermissions())) {
            return;
        }

        $reorder = false;
        $data = $this->post;

        // Special handler for pages data.
        if ($this->view == 'pages') {
            /** @var Page\Pages $pages */
            $pages = $this->grav['pages'];

            // Find new parent page in order to build the path.
            $route = !isset($data['route']) ? dirname($this->admin->route) : $data['route'];
            $parent = $route && $route != '/' ? $pages->dispatch($route, true) : $pages->root();

            $obj = $this->admin->page(true);

            $original_slug = $obj->slug();
            $original_order = intval(trim($obj->order(), '.'));

            // Change parent if needed and initialize move (might be needed also on ordering/folder change).
            $obj = $obj->move($parent);
            $this->preparePage($obj, false, $obj->language());

            // Reset slug and route. For now we do not support slug twig variable on save.
            $obj->slug($original_slug);

            $obj->validate();
            $obj->filter();

            // rename folder based on visible
            if ($original_order == 1000) {
                // increment order to force reshuffle
                $obj->order($original_order + 1);
            }

            // add or remove numeric prefix based on ordering value
            if (isset($data['ordering'])) {
                if ($data['ordering'] && !$obj->order()) {
                    $obj->order(1001);
                } elseif (!$data['ordering'] && $obj->order()) {
                    $obj->folder($obj->slug());
                }
            }


        } else {
            // Handle standard data types.
            $obj = $this->prepareData();
            $obj->validate();
            $obj->filter();
        }

        if ($obj) {
            $obj->save(true);
            $this->admin->setMessage($this->admin->translate('PLUGIN_ADMIN.SUCCESSFULLY_SAVED'), 'info');
        }

        if ($this->view != 'pages') {
            // Force configuration reload.
            /** @var Config $config */
            $config = $this->grav['config'];
            $config->reload();

            if ($this->view === 'users') {
                $this->grav['user']->merge(User::load($this->admin->route)->toArray());
            }
        }

        // Always redirect if a page route was changed, to refresh it
        if ($obj instanceof Page\Page) {
            if (method_exists($obj, 'unsetRouteSlug')) {
                $obj->unsetRouteSlug();
            }

            $multilang = $this->isMultilang();

            if ($multilang) {
                if (!$obj->language()) {
                    $obj->language($this->grav['session']->admin_lang);
                }
            }
            $admin_route = $this->grav['config']->get('plugins.admin.route');
            $redirect_url = '/' . ($multilang ? ($obj->language()) : '') . $admin_route . '/' . $this->view . $obj->route();

            $this->setRedirect($redirect_url);
        }

        return true;
    }

    /**
     * Continue to the new page.
     *
     * @return bool True if the action was performed.
     */
    public function taskContinue()
    {
        if ($this->view == 'users') {
            $this->setRedirect("{$this->view}/{$this->post['username']}");
            return true;
        }

        if ($this->view != 'pages') {
            return false;
        }

        $data = $this->post;
        $route = $data['route'] != '/' ? $data['route'] : '';
        $folder = ltrim($data['folder'], '_');
        if (!empty($data['modular'])) {
            $folder = '_' . $folder;
        }
        $path = $route . '/' . $folder;

        $this->admin->session()->{$path} = $data;

        // Store the name and route of a page, to be used prefilled defaults of the form in the future
        $this->admin->session()->lastPageName = $data['name'];
        $this->admin->session()->lastPageRoute = $data['route'];

        $this->setRedirect("{$this->view}/". ltrim($path, '/'));

        return true;
    }

    /**
     * Save page as a new copy.
     *
     * @return bool True if the action was performed.
     * @throws \RuntimeException
     */
    protected function taskCopy()
    {
        if (!$this->authorizeTask('copy page', ['admin.pages', 'admin.super'])) {
            return;
        }

        // Only applies to pages.
        if ($this->view != 'pages') {
            return false;
        }

        try {
            /** @var Page\Pages $pages */
            $pages = $this->grav['pages'];
            $data = $this->post;

            // And then get the current page.
            $page = $this->admin->page(true);

            // Find new parent page in order to build the path.
            $parent = $page->parent() ?: $pages->root();

            // Make a copy of the current page and fill the updated information into it.
            $page = $page->copy($parent);
            $this->preparePage($page);

            // Make sure the header is loaded in case content was set through raw() (expert mode)
            $page->header();

            // Deal with folder naming conflicts, but limit number of searches to 99.
            $break = 99;
            while ($break > 0 && file_exists($page->filePath())) {
                $break--;
                $match = preg_split('/-(\d+)$/', $page->path(), 2, PREG_SPLIT_DELIM_CAPTURE);
                $page->path($match[0] . '-' . (isset($match[1]) ? (int) $match[1] + 1 : 2));
                // Reset slug and route. For now we do not support slug twig variable on save.
                $page->slug('');
            }

            $page->save();

            // Enqueue message and redirect to new location.
            $this->admin->setMessage($this->admin->translate('PLUGIN_ADMIN.SUCCESSFULLY_COPIED'), 'info');
            $parent_route = $parent->route() ? '/' . ltrim($parent->route(), '/') : '';
            $this->setRedirect($this->view . $parent_route . '/'. $page->slug());

        } catch (\Exception $e) {
            throw new \RuntimeException('Copying page failed on error: ' . $e->getMessage());
        }

        return true;
    }

    /**
     * Reorder pages.
     *
     * @return bool True if the action was performed.
     */
    protected function taskReorder()
    {
        if (!$this->authorizeTask('reorder pages', ['admin.pages', 'admin.super'])) {
            return;
        }

        // Only applies to pages.
        if ($this->view != 'pages') {
            return false;
        }

        $this->admin->setMessage($this->admin->translate('PLUGIN_ADMIN.REORDERING_WAS_SUCCESSFUL'), 'info');
        return true;
    }

    /**
     * Delete page.
     *
     * @return bool True if the action was performed.
     * @throws \RuntimeException
     */
    protected function taskDelete()
    {
        if (!$this->authorizeTask('delete page', ['admin.pages', 'admin.super'])) {
            return;
        }

        // Only applies to pages.
        if ($this->view != 'pages') {
            return false;
        }

        /** @var Uri $uri */
        $uri = $this->grav['uri'];

        try {
            $page = $this->admin->page();

            if (count($page->translatedLanguages()) > 1) {
                $page->file()->delete();
            } else {
                Folder::delete($page->path());
            }


            $results = Cache::clearCache('standard');

            // Set redirect to either referrer or pages list.
            $redirect = 'pages';

            $this->admin->setMessage($this->admin->translate('PLUGIN_ADMIN.SUCCESSFULLY_DELETED'), 'info');
            $this->setRedirect($redirect);

        } catch (\Exception $e) {
            throw new \RuntimeException('Deleting page failed on error: ' . $e->getMessage());
        }

        return true;
    }

    /**
     * Switch the content language. Optionally redirect to a different page.
     *
     * @return bool True if the action was performed.
     */
    protected function taskSwitchlanguage() {
        $data = $this->post;

        if (isset($data['lang'])) {
            $language = $data['lang'];
        } else {
            $language = $this->grav['uri']->param('lang');
        }

        if (isset($data['redirect'])) {
            $redirect = 'pages/' . $data['redirect'];
        } else {
            $redirect = 'pages';
        }


        if ($language) {
            $this->grav['session']->admin_lang = $language ?: 'en';
        }

        $this->admin->setMessage($this->admin->translate('PLUGIN_ADMIN.SUCCESSFULLY_SWITCHED_LANGUAGE'), 'info');

        $admin_route = $this->grav['config']->get('plugins.admin.route');
        $this->setRedirect('/' . $language . $admin_route . '/' . $redirect);

    }

    /**
     * Save the current page in a different language. Automatically switches to that language.
     *
     * @return bool True if the action was performed.
     */
    protected function taskSaveas() {
        if (!$this->authorizeTask('save', $this->dataPermissions())) {
            return;
        }

        // $reorder = false;
        $data = $this->post;
        $language = $data['lang'];

        if ($language) {
            $this->grav['session']->admin_lang = $language ?: 'en';
        }

        // /** @var Page\Pages $pages */
        $pages = $this->grav['pages'];

        $uri = $this->grav['uri'];
        $obj = $this->admin->page($uri->route());
        $this->preparePage($obj, false, $language);

        $file = $obj->file();
        if ($file) {
            $filename = substr($obj->name(), 0, -(strlen('.' . $language . '.md')));

            if (substr($filename, -3, 1) == '.') {
                if (substr($filename, -2) == substr($language, 0, 2)) {
                    $filename = str_replace(substr($filename, -2), $language, $filename);
                }
            } elseif (substr($filename, -6, 1) == '.') {
                if (substr($filename, -5) == substr($language, 0, 5)) {
                    $filename = str_replace(substr($filename, -5), $language, $filename);
                }
            } else {
                $filename .= '.' . $language;
            }

            $path = $obj->path() . DS . $filename . '.md';
            $aFile = File::instance($path);
            $aFile->save();

            $aPage = new Page\Page();
            $aPage->init(new \SplFileInfo($path), $language .'.md');
            $aPage->header($obj->header());
            $aPage->rawMarkdown($obj->rawMarkdown());
            $aPage->validate();
            $aPage->filter();
            $aPage->save();
        }

        $this->admin->setMessage($this->admin->translate('PLUGIN_ADMIN.SUCCESSFULLY_SWITCHED_LANGUAGE'), 'info');
        $this->setRedirect('/' . $language . $uri->route());

        return true;
    }

    /**
     * Prepare and return POST data.
     *
     * @param array $post
     * @return array
     */
    protected function &getPost($post)
    {
        unset($post['task']);

        // Decode JSON encoded fields and merge them to data.
        if (isset($post['_json'])) {
            $post = array_merge_recursive($post, $this->jsonDecode($post['_json']));
            unset($post['_json']);
        }
        return $post;
    }

    /**
     * Recursively JSON decode data.
     *
     * @param  array $data
     * @return array
     */
    protected function jsonDecode(array $data)
    {
        foreach ($data as &$value) {
            if (is_array($value)) {
                $value = $this->jsonDecode($value);
            } else {
                $value = json_decode($value, true);
            }
        }
        return $data;
    }

    /**
     * Sets the page redirect.
     *
     * @param string $path The path to redirect to
     * @param int $code The HTTP redirect code
     */
    protected function setRedirect($path, $code = 303)
    {
        $this->redirect = $path;
        $this->code = $code;
    }

    /**
     * Gets the configuration data for a given view & post
     *
     * @return object
     */
    protected function prepareData()
    {
        $type = trim("{$this->view}/{$this->admin->route}", '/');
        $data = $this->admin->data($type, $this->post);

        return $data;
    }

    /**
     * Gets the permissions needed to access a given view
     *
     * @return array An array of permissions
     */
    protected function dataPermissions()
    {
        $type = $this->view;
        $permissions = ['admin.super'];

        switch ($type) {
            case 'configuration':
            case 'system':
                $permissions[] = 'admin.configuration';
                break;
            case 'settings':
            case 'site':
                $permissions[] = 'admin.settings';
                break;
            case 'plugins':
                $permissions[] = 'admin.plugins';
                break;
            case 'themes':
                $permissions[] = 'admin.themes';
                break;
            case 'users':
                $permissions[] = 'admin.users';
                break;
            case 'pages':
                $permissions[] = 'admin.pages';
                break;
        }

        return $permissions;
    }

    /**
     * Prepare a page to be stored: update its folder, name, template, header and content
     *
     * @param \Grav\Common\Page\Page $page
     * @param bool                   $clean_header
     */
    protected function preparePage(\Grav\Common\Page\Page $page, $clean_header = false, $language = null)
    {
        $input = $this->post;

        if (isset($input['order'])) {
            $order = max(0, (int) isset($input['order']) ? $input['order'] : $page->value('order'));
            $ordering = $order ? sprintf('%02d.', $order) : '';
            $slug = empty($input['folder']) ? $page->value('folder') : (string) $input['folder'];
            $page->folder($ordering . $slug);
        }

        if (isset($input['name']) && !empty($input['name'])) {
            $type = (string) strtolower($input['name']);
            $name = preg_replace('|.*/|', '', $type);
            if ($language) {
                $name .= '.' . $language;
            } else {
                $language = $this->grav['language'];
                if ($language->enabled()) {
                    $name .= '.' . $language->getLanguage();
                }
            }
            $name .= '.md';
            $page->name($name);
            $page->template($type);
        }

        // Special case for Expert mode: build the raw, unset content
        if (isset($input['frontmatter']) && isset($input['content'])) {
            $page->raw("---\n" . (string) $input['frontmatter'] . "\n---\n" . (string) $input['content']);
            unset($input['content']);
        }

        if (isset($input['header'])) {
            $header = $input['header'];

            foreach($header as $key => $value) {
                if ($key == 'metadata') {
                    foreach ($header['metadata'] as $key2 => $value2) {
                        if (isset($input['toggleable_header']['metadata'][$key2]) && !$input['toggleable_header']['metadata'][$key2]) {
                            $header['metadata'][$key2] = '';
                        }
                    }
                } elseif ($key == 'taxonomy') {
                    foreach ($header[$key] as $taxkey => $taxonomy) {
                        if (is_array($taxonomy) && count($taxonomy) == 1 && trim($taxonomy[0]) == '') {
                            unset($header[$key][$taxkey]);
                        }
                    }
                } else {
                    if (isset($input['toggleable_header'][$key]) && !$input['toggleable_header'][$key]) {
                        $header[$key] = null;
                    }
                }
            }
            if ($clean_header) {
                $header = Utils::arrayFilterRecursive($header, function($k, $v) {
                    return !(is_null($v) || $v === '');
                });
            }
            $page->header((object) $header);
            $page->frontmatter(Yaml::dump((array) $page->header()));
        }
        // Fill content last because it also renders the output.
        if (isset($input['content'])) {
            $page->rawMarkdown((string) $input['content']);
        }
    }

    /**
     * Checks if the user is allowed to perform the given task with its associated permissions
     *
     * @param string $task The task to execute
     * @param array $permissions The permissions given
     * @return bool True if authorized. False if not.
     */
    protected function authorizeTask($task = '', $permissions = [])
    {
        if (!$this->admin->authorize($permissions)) {
            if ($this->grav['uri']->extension() === 'json')
                $this->admin->json_response = ['status' => 'unauthorized', 'message' => $this->admin->translate('PLUGIN_ADMIN.INSUFFICIENT_PERMISSIONS_FOR_TASK') . ' ' . $task . '.'];
            else
                $this->admin->setMessage($this->admin->translate('PLUGIN_ADMIN.INSUFFICIENT_PERMISSIONS_FOR_TASK') . ' ' . $task . '.', 'error');

            return false;
        }

        return true;
    }
}
