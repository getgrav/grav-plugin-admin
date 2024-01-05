<?php

/**
 * @package    Grav\Plugin\Admin
 *
 * @copyright  Copyright (c) 2015 - 2024 Trilby Media, LLC. All rights reserved.
 * @license    MIT License; see LICENSE file for details.
 */

namespace Grav\Plugin\Admin;

use Grav\Common\Cache;
use Grav\Common\Config\Config;
use Grav\Common\Data\Data;
use Grav\Common\Debugger;
use Grav\Common\Filesystem\Folder;
use Grav\Common\Grav;
use Grav\Common\Media\Interfaces\MediaInterface;
use Grav\Common\Page\Interfaces\PageInterface;
use Grav\Common\Page\Media;
use Grav\Common\Security;
use Grav\Common\Uri;
use Grav\Common\User\Interfaces\UserInterface;
use Grav\Common\Utils;
use Grav\Common\Plugin;
use Grav\Common\Theme;
use Grav\Framework\Controller\Traits\ControllerResponseTrait;
use Grav\Framework\RequestHandler\Exception\RequestException;
use JsonException;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use RocketTheme\Toolbox\Event\Event;
use RocketTheme\Toolbox\File\File;
use RocketTheme\Toolbox\ResourceLocator\UniformResourceLocator;

/**
 * Class AdminController
 *
 * @package Grav\Plugin
 */
class AdminBaseController
{
    use ControllerResponseTrait;

    /** @var Grav */
    public $grav;
    /** @var string */
    public $view;
    /** @var string */
    public $task;
    /** @var string */
    public $route;
    /** @var array */
    public $post;
    /** @var array|null */
    public $data;
    /** @var array */
    public $blacklist_views = [];

    /** @var Uri */
    protected $uri;
    /** @var Admin */
    protected $admin;
    /** @var string */
    protected $redirect;
    /** @var int */
    protected $redirectCode;

    /** @var string[] */
    protected $upload_errors = [
        0 => 'There is no error, the file uploaded with success',
        1 => 'The uploaded file exceeds the max upload size',
        2 => 'The uploaded file exceeds the MAX_FILE_SIZE directive that was specified in the HTML',
        3 => 'The uploaded file was only partially uploaded',
        4 => 'No file was uploaded',
        6 => 'Missing a temporary folder',
        7 => 'Failed to write file to disk',
        8 => 'A PHP extension stopped the file upload'
    ];

    /**
     * Performs a task.
     *
     * @return bool True if the action was performed successfully.
     */
    public function execute()
    {
        if (null === $this->admin) {
            $this->admin = $this->grav['admin'];
        }

        // Ignore blacklisted views.
        if (in_array($this->view, $this->blacklist_views, true)) {
            return false;
        }

        // Make sure that user is logged into admin.
        if (!$this->admin->authorize()) {
            return false;
        }

        // Always validate nonce.
        if (!$this->validateNonce()) {
            return false;
        }

        $method = 'task' . ucfirst($this->task);

        if (method_exists($this, $method)) {
            try {
                $response = $this->{$method}();
            } catch (RequestException $e) {
                /** @var Debugger $debugger */
                $debugger = $this->grav['debugger'];
                $debugger->addException($e);

                $response = $this->createErrorResponse($e);
            } catch (\RuntimeException $e) {
                /** @var Debugger $debugger */
                $debugger = $this->grav['debugger'];
                $debugger->addException($e);

                $response = true;
                $this->admin->setMessage($e->getMessage(), 'error');
            }
        } else {
            $response = $this->grav->fireEvent('onAdminTaskExecute',
                new Event(['controller' => $this, 'method' => $method]));
        }

        if ($response instanceof ResponseInterface) {
            $this->close($response);
        }

        // Grab redirect parameter.
        $redirect = $this->post['_redirect'] ?? null;
        unset($this->post['_redirect']);

        // Redirect if requested.
        if ($redirect) {
            $this->setRedirect($redirect);
        }

        return $response;
    }

    protected function validateNonce()
    {
        if (strtolower($_SERVER['REQUEST_METHOD']) === 'post') {
            if (isset($this->post['admin-nonce'])) {
                $nonce = $this->post['admin-nonce'];
            } else {
                $nonce = $this->grav['uri']->param('admin-nonce');
            }

            if (!$nonce || !Utils::verifyNonce($nonce, 'admin-form')) {
                if ($this->task === 'addmedia') {

                    $message = sprintf($this->admin::translate('PLUGIN_ADMIN.FILE_TOO_LARGE', null),
                        ini_get('post_max_size'));

                    //In this case it's more likely that the image is too big than POST can handle. Show message
                    $this->admin->json_response = [
                        'status'  => 'error',
                        'message' => $message
                    ];

                    return false;
                }

                $this->admin->setMessage($this->admin::translate('PLUGIN_ADMIN.INVALID_SECURITY_TOKEN'), 'error');
                $this->admin->json_response = [
                    'status'  => 'error',
                    'message' => $this->admin::translate('PLUGIN_ADMIN.INVALID_SECURITY_TOKEN')
                ];

                return false;
            }
            unset($this->post['admin-nonce']);
        } else {
            if ($this->task === 'logout') {
                $nonce = $this->grav['uri']->param('logout-nonce');
                if (null === $nonce || !Utils::verifyNonce($nonce, 'logout-form')) {
                    $this->admin->setMessage($this->admin::translate('PLUGIN_ADMIN.INVALID_SECURITY_TOKEN'),
                        'error');
                    $this->admin->json_response = [
                        'status'  => 'error',
                        'message' => $this->admin::translate('PLUGIN_ADMIN.INVALID_SECURITY_TOKEN')
                    ];

                    return false;
                }
            } else {
                $nonce = $this->grav['uri']->param('admin-nonce');
                if (null === $nonce || !Utils::verifyNonce($nonce, 'admin-form')) {
                    $this->admin->setMessage($this->admin::translate('PLUGIN_ADMIN.INVALID_SECURITY_TOKEN'),
                        'error');
                    $this->admin->json_response = [
                        'status'  => 'error',
                        'message' => $this->admin::translate('PLUGIN_ADMIN.INVALID_SECURITY_TOKEN')
                    ];

                    return false;
                }
            }
        }

        return true;
    }

    /**
     * Sets the page redirect.
     *
     * @param string $path The path to redirect to
     * @param int    $code The HTTP redirect code
     * @return void
     */
    public function setRedirect($path, $code = 303)
    {
        $this->redirect     = $path;
        $this->redirectCode = $code;
    }

    /**
     * Sends JSON response and terminates the call.
     *
     * @param array $json
     * @param int $code
     * @return never-return
     */
    protected function sendJsonResponse(array $json, $code = 200): void
    {
        // JSON response.
        $response = $this->createJsonResponse($json, $code);

        $this->close($response);
    }

    /**
     * @param ResponseInterface $response
     * @return never-return
     */
    protected function close(ResponseInterface $response): void
    {
        $this->grav->close($response);
    }

    /**
     * Handles ajax upload for files.
     * Stores in a flash object the temporary file and deals with potential file errors.
     *
     * @return bool True if the action was performed.
     */
    public function taskFilesUpload()
    {
        if (null === $_FILES || !$this->authorizeTask('upload file', $this->dataPermissions())) {
            return false;
        }

        /** @var Config $config */
        $config   = $this->grav['config'];
        $data     = $this->view === 'pages' ? $this->admin->page(true) : $this->prepareData([]);
        $settings = $data->blueprints()->schema()->getProperty($this->post['name']);
        $settings = (object)array_merge([
            'avoid_overwriting' => false,
            'random_name'       => false,
            'accept'            => ['image/*'],
            'limit'             => 10,
            'filesize'          => Utils::getUploadLimit()
        ], (array)$settings, ['name' => $this->post['name']]);

        $upload = $this->normalizeFiles($_FILES['data'], $settings->name);

        $filename = $upload->file->name;

        // Handle bad filenames.
        if (!Utils::checkFilename($filename)) {
            $this->admin->json_response = [
                'status'  => 'error',
                'message' => sprintf($this->admin::translate('PLUGIN_ADMIN.FILEUPLOAD_UNABLE_TO_UPLOAD', null),
                    htmlspecialchars($filename, ENT_QUOTES | ENT_HTML5, 'UTF-8'), 'Bad filename')
            ];

            return false;
        }

        if (!isset($settings->destination)) {
            $this->admin->json_response = [
                'status'  => 'error',
                'message' => $this->admin::translate('PLUGIN_ADMIN.DESTINATION_NOT_SPECIFIED', null)
            ];

            return false;
        }

        // Do not use self@ outside of pages
        if ($this->view !== 'pages' && in_array($settings->destination, ['@self', 'self@', '@self@'])) {
            $this->admin->json_response = [
                'status'  => 'error',
                'message' => sprintf($this->admin::translate('PLUGIN_ADMIN.FILEUPLOAD_PREVENT_SELF', null),
                    htmlspecialchars($settings->destination, ENT_QUOTES | ENT_HTML5, 'UTF-8'))
            ];

            return false;
        }

        // Handle errors and breaks without proceeding further
        if ($upload->file->error !== UPLOAD_ERR_OK) {
            $this->admin->json_response = [
                'status'  => 'error',
                'message' => sprintf($this->admin::translate('PLUGIN_ADMIN.FILEUPLOAD_UNABLE_TO_UPLOAD', null),
                    htmlspecialchars($filename, ENT_QUOTES | ENT_HTML5, 'UTF-8'),
                    $this->upload_errors[$upload->file->error])
            ];

            return false;
        }

        // Handle file size limits
        $settings->filesize *= 1048576; // 2^20 [MB in Bytes]
        if ($settings->filesize > 0 && $upload->file->size > $settings->filesize) {
            $this->admin->json_response = [
                'status'  => 'error',
                'message' => $this->admin::translate('PLUGIN_ADMIN.EXCEEDED_GRAV_FILESIZE_LIMIT')
            ];

            return false;
        }

        // Handle Accepted file types
        // Accept can only be mime types (image/png | image/*) or file extensions (.pdf|.jpg)
        $accepted = false;
        $errors   = [];

        // Do not trust mimetype sent by the browser
        $mime = Utils::getMimeByFilename($filename);

        foreach ((array)$settings->accept as $type) {
            // Force acceptance of any file when star notation
            if ($type === '*') {
                $accepted = true;
                break;
            }

            $isMime = strstr($type, '/');
            $find   = str_replace(['.', '*', '+'], ['\.', '.*', '\+'], $type);

            if ($isMime) {
                $match = preg_match('#' . $find . '$#', $mime);
                if (!$match) {
                    $errors[] = htmlspecialchars('The MIME type "' . $mime . '" for the file "' . $filename . '" is not an accepted.', ENT_QUOTES | ENT_HTML5, 'UTF-8');
                } else {
                    $accepted = true;
                    break;
                }
            } else {
                $match = preg_match('#' . $find . '$#', $filename);
                if (!$match) {
                    $errors[] = htmlspecialchars('The File Extension for the file "' . $filename . '" is not an accepted.', ENT_QUOTES | ENT_HTML5, 'UTF-8');
                } else {
                    $accepted = true;
                    break;
                }
            }
        }

        if (!$accepted) {
            $this->admin->json_response = [
                'status'  => 'error',
                'message' => implode('<br />', $errors)
            ];

            return false;
        }

        // Remove the error object to avoid storing it
        unset($upload->file->error);

        // we need to move the file at this stage or else
        // it won't be available upon save later on
        // since php removes it from the upload location
        $tmp_dir  = Admin::getTempDir();
        $tmp_file = $upload->file->tmp_name;
        $tmp      = $tmp_dir . '/uploaded-files/' . Utils::basename($tmp_file);

        Folder::create(dirname($tmp));
        if (!move_uploaded_file($tmp_file, $tmp)) {
            $this->admin->json_response = [
                'status'  => 'error',
                'message' => sprintf(
                    $this->admin::translate('PLUGIN_ADMIN.FILEUPLOAD_UNABLE_TO_MOVE', null),
                    '',
                    htmlspecialchars($tmp, ENT_QUOTES | ENT_HTML5, 'UTF-8')
                )
            ];

            return false;
        }

        // Special Sanitization for SVG
        if (Utils::contains($mime, 'svg', false)) {
            Security::sanitizeSVG($tmp);
        }

        $upload->file->tmp_name = $tmp;

        // Retrieve the current session of the uploaded files for the field
        // and initialize it if it doesn't exist
        $sessionField = base64_encode($this->grav['uri']->url());
        $flash        = $this->admin->session()->getFlashObject('files-upload') ?? [];
        if (!isset($flash[$sessionField])) {
            $flash[$sessionField] = [];
        }
        if (!isset($flash[$sessionField][$upload->field])) {
            $flash[$sessionField][$upload->field] = [];
        }

        // Set destination
        if ($this->grav['locator']->isStream($settings->destination)) {
            $destination = $this->grav['locator']->findResource($settings->destination, false, true);
        } else {
            $destination = Folder::getRelativePath(rtrim($settings->destination, '/'));
            $destination = $this->admin->getPagePathFromToken($destination);
        }

        // Create destination if needed
        if (!is_dir($destination)) {
            Folder::mkdir($destination);
        }

        // Generate random name if required
        if ($settings->random_name) { // TODO: document
            $extension          = Utils::pathinfo($upload->file->name, PATHINFO_EXTENSION);
            $upload->file->name = Utils::generateRandomString(15) . '.' . $extension;
        }

        // Handle conflicting name if needed
        if ($settings->avoid_overwriting) { // TODO: document
            if (file_exists($destination . '/' . $upload->file->name)) {
                $upload->file->name = date('YmdHis') . '-' . $upload->file->name;
            }
        }

        // Prepare object for later save
        $path               = $destination . '/' . $upload->file->name;
        $upload->file->path = $path;
        // $upload->file->route = $page ? $path : null;

        // Prepare data to be saved later
        $flash[$sessionField][$upload->field][$path] = (array)$upload->file;

        // Finally store the new uploaded file in the field session
        $this->admin->session()->setFlashObject('files-upload', $flash);
        $this->admin->json_response = [
            'status'  => 'success',
            'session' => \json_encode([
                'sessionField' => base64_encode($this->grav['uri']->url()),
                'path'         => $upload->file->path,
                'field'        => $settings->name
            ])
        ];

        return true;
    }

    /**
     * Checks if the user is allowed to perform the given task with its associated permissions
     *
     * @param string $task        The task to execute
     * @param array  $permissions The permissions given
     *
     * @return bool True if authorized. False if not.
     */
    public function authorizeTask($task = '', $permissions = [])
    {
        if (!$this->admin->authorize($permissions)) {
            if ($this->grav['uri']->extension() === 'json') {
                $this->admin->json_response = [
                    'status'  => 'unauthorized',
                    'message' => $this->admin::translate('PLUGIN_ADMIN.INSUFFICIENT_PERMISSIONS_FOR_TASK') . ' ' . $task . '.'
                ];
            } else {
                $this->admin->setMessage($this->admin::translate('PLUGIN_ADMIN.INSUFFICIENT_PERMISSIONS_FOR_TASK') . ' ' . $task . '.',
                    'error');
            }

            return false;
        }

        return true;
    }

    /**
     * Checks if the user is allowed to perform the given task with its associated permissions.
     * Throws exception if the check fails.
     *
     * @param string $task        The task to execute
     * @param array  $permissions The permissions given
     * @throws RequestException
     */
    public function checkTaskAuthorization($task = '', $permissions = [])
    {
        if (!$this->admin->authorize($permissions)) {
            throw new RequestException($this->getRequest(), $this->admin::translate('PLUGIN_ADMIN.INSUFFICIENT_PERMISSIONS_FOR_TASK') . ' ' . $task . '.', 403);
        }
    }

    /**
     * Gets the permissions needed to access a given view
     *
     * @return array An array of permissions
     */
    protected function dataPermissions()
    {
        $type        = $this->view;
        $permissions = ['admin.super'];

        switch ($type) {
            case 'config':
                $type = $this->route ?: 'system';
                $permissions[] = 'admin.configuration.' . $type;
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
            case 'user':
                $permissions[] = 'admin.login';
                $permissions[] = 'admin.users';
                break;
            case 'pages':
                $permissions[] = 'admin.pages';
                break;
            default:
                $permissions[] = 'admin.configuration.' . $type;
                $permissions[] = 'admin.configuration_' . $type;
        }

        return $permissions;
    }

    /**
     * Gets the configuration data for a given view & post
     *
     * @param array $data
     *
     * @return array
     */
    protected function prepareData(array $data)
    {
        return $data;
    }

    /**
     * Internal method to normalize the $_FILES array
     *
     * @param array  $data $_FILES starting point data
     * @param string $key
     *
     * @return object a new Object with a normalized list of files
     */
    protected function normalizeFiles($data, $key = '')
    {
        $files        = new \stdClass();
        $files->field = $key;
        $files->file  = new \stdClass();

        foreach ($data as $fieldName => $fieldValue) {
            // Since Files Upload are always happening via Ajax
            // we are not interested in handling `multiple="true"`
            // because they are always handled one at a time.
            // For this reason we normalize the value to string,
            // in case it is arriving as an array.
            $value                     = (array)Utils::getDotNotation($fieldValue, $key);
            $files->file->{$fieldName} = array_shift($value);
        }

        return $files;
    }

    /**
     * Removes a file from the flash object session, before it gets saved
     *
     * @return bool True if the action was performed.
     */
    public function taskFilesSessionRemove()
    {
        if (!$this->authorizeTask('delete file', $this->dataPermissions())) {
            return false;
        }

        // Retrieve the current session of the uploaded files for the field
        // and initialize it if it doesn't exist
        $sessionField = base64_encode($this->grav['uri']->url());
        $request      = \json_decode($this->post['session']);

        // Ensure the URI requested matches the current one, otherwise fail
        if ($request->sessionField !== $sessionField) {
            return false;
        }

        // Retrieve the flash object and remove the requested file from it
        $flash    = $this->admin->session()->getFlashObject('files-upload') ?? [];
        $endpoint = $flash[$request->sessionField][$request->field][$request->path] ?? null;

        if (isset($endpoint)) {
            if (file_exists($endpoint['tmp_name'])) {
                unlink($endpoint['tmp_name']);
            }

            unset($endpoint);
        }

        // Walk backward to cleanup any empty field that's left
        // Field
        if (isset($flash[$request->sessionField][$request->field][$request->path])) {
            unset($flash[$request->sessionField][$request->field][$request->path]);
        }

        // Field
        if (isset($flash[$request->sessionField][$request->field]) && empty($flash[$request->sessionField][$request->field])) {
            unset($flash[$request->sessionField][$request->field]);
        }

        // Session Field
        if (isset($flash[$request->sessionField]) && empty($flash[$request->sessionField])) {
            unset($flash[$request->sessionField]);
        }


        // If there's anything left to restore in the flash object, do so
        if (count($flash)) {
            $this->admin->session()->setFlashObject('files-upload', $flash);
        }

        $this->admin->json_response = ['status' => 'success'];

        return true;
    }

    /**
     * Redirect to the route stored in $this->redirect
     *
     * Route may or may not be prefixed by /en or /admin or /en/admin.
     *
     * @return void
     */
    public function redirect()
    {
        $this->admin->redirect($this->redirect, $this->redirectCode);
    }

    /**
     * Prepare and return POST data.
     *
     * @param array $post
     * @return array
     */
    protected function getPost($post)
    {
        if (!is_array($post)) {
            return [];
        }

        unset($post['task']);

        // Decode JSON encoded fields and merge them to data.
        if (isset($post['_json'])) {
            $post = array_replace_recursive($post, $this->jsonDecode($post['_json']));
            unset($post['_json']);
        }

        return $this->cleanDataKeys($post);
    }

    /**
     * Recursively JSON decode data.
     *
     * @param array $data
     * @return array
     * @throws JsonException
     * @internal Do not use directly!
     */
    protected function jsonDecode(array $data): array
    {
        foreach ($data as &$value) {
            if (is_array($value)) {
                $value = $this->jsonDecode($value);
            } else {
                $value = json_decode($value, true, 512, JSON_THROW_ON_ERROR);
            }
        }

        return $data;
    }

    /**
     * @param array $source
     * @return array
     * @internal Do not use directly!
     */
    protected function cleanDataKeys(array $source): array
    {
        $out = [];
        foreach ($source as $key => $value) {
            $key = str_replace(['%5B', '%5D'], ['[', ']'], $key);
            if (is_array($value)) {
                $out[$key] = $this->cleanDataKeys($value);
            } else {
                $out[$key] = $value;
            }
        }

        return $out;
    }

    /**
     * Return true if multilang is active
     *
     * @return bool True if multilang is active
     */
    protected function isMultilang()
    {
        return count($this->grav['config']->get('system.languages.supported', [])) > 1;
    }

    /**
     * @param PageInterface|UserInterface|Data $obj
     *
     * @return PageInterface|UserInterface|Data
     */
    protected function storeFiles($obj)
    {
        // Process previously uploaded files for the current URI
        // and finally store them. Everything else will get discarded
        $queue = $this->admin->session()->getFlashObject('files-upload');
        if (is_array($queue)) {
            $queue = $queue[base64_encode($this->grav['uri']->url())];
            foreach ($queue as $key => $files) {
                foreach ($files as $destination => $file) {
                    if (!rename($file['tmp_name'], $destination)) {
                        throw new \RuntimeException(sprintf($this->admin->translate('PLUGIN_ADMIN.FILEUPLOAD_UNABLE_TO_MOVE',
                            null), '"' . $file['tmp_name'] . '"', $destination));
                    }

                    unset($files[$destination]['tmp_name']);
                }

                if ($this->view === 'pages') {
                    $keys     = explode('.', preg_replace('/^header./', '', $key));
                    $init_key = array_shift($keys);
                    if (count($keys) > 0) {
                        $new_data = $obj->header()->{$init_key} ?? [];
                        Utils::setDotNotation($new_data, implode('.', $keys), $files, true);
                    } else {
                        $new_data = $files;
                    }
                    if (isset($obj->header()->{$init_key})) {
                        $obj->modifyHeader($init_key,
                            array_replace_recursive([], $obj->header()->{$init_key}, $new_data));
                    } else {
                        $obj->modifyHeader($init_key, $new_data);
                    }
                } elseif ($obj instanceof UserInterface and $key === 'avatar') {
                    $obj->set($key, $files);
                } else {
                    // TODO: [this is JS handled] if it's single file, remove existing and use set, if it's multiple, use join
                    $obj->join($key, $files); // stores
                }

            }
        }

        return $obj;
    }

    /**
     * Used by the filepicker field to get a list of files in a folder.
     *
     * @return bool
     */
    protected function taskGetFilesInFolder()
    {
        if (!$this->authorizeTask('get files', $this->dataPermissions())) {
            return false;
        }

        $data = $this->view === 'pages' ? $this->admin->page(true) : $this->prepareData([]);

        if (null === $data) {
            return false;
        }

        if (method_exists($data, 'blueprints')) {
            $settings = $data->blueprints()->schema()->getProperty($this->post['name']);
        } elseif (method_exists($data, 'getBlueprint')) {
            $settings = $data->getBlueprint()->schema()->getProperty($this->post['name']);
        }

        if (isset($settings['folder'])) {
            $folder = $settings['folder'];
        } else {
            $folder = 'self@';
        }

        // Do not use self@ outside of pages
        if ($this->view !== 'pages' && in_array($folder, ['@self', 'self@', '@self@'])) {
            if (!$data instanceof MediaInterface) {
                $this->admin->json_response = [
                    'status'  => 'error',
                    'message' => sprintf($this->admin::translate('PLUGIN_ADMIN.FILEUPLOAD_PREVENT_SELF', null), $folder)
                ];

                return false;
            }

            $media = $data->getMedia();
        } else {
            /** @var UniformResourceLocator $locator */
            $locator = $this->grav['locator'];
            if ($locator->isStream($folder)) {
                $folder = $locator->findResource($folder);
            }

            // Set destination
            $folder = Folder::getRelativePath(rtrim($folder, '/'));
            $folder = $this->admin->getPagePathFromToken($folder);

            $media = new Media($folder);
        }

        $available_files = [];
        $metadata = [];
        $thumbs = [];


        foreach ($media->all() as $name => $medium) {

           $available_files[] = $name;

            if (isset($settings['include_metadata'])) {
                $img_metadata = $medium->metadata();
                if ($img_metadata) {
                    $metadata[$name] = $img_metadata;
                }
            }

        }

        // Peak in the flashObject for optimistic filepicker updates
        $pending_files = [];
        $sessionField  = base64_encode($this->grav['uri']->url());
        $flash         = $this->admin->session()->getFlashObject('files-upload');

        if ($flash && isset($flash[$sessionField])) {
            foreach ($flash[$sessionField] as $field => $data) {
                foreach ($data as $file) {
                    if (dirname($file['path']) === $folder) {
                        $pending_files[] = $file['name'];
                    }
                }
            }
        }

        $this->admin->session()->setFlashObject('files-upload', $flash);

        // Handle Accepted file types
        // Accept can only be file extensions (.pdf|.jpg)
        if (isset($settings['accept'])) {
            $available_files = array_filter($available_files, function ($file) use ($settings) {
                return $this->filterAcceptedFiles($file, $settings);
            });

            $pending_files = array_filter($pending_files, function ($file) use ($settings) {
                return $this->filterAcceptedFiles($file, $settings);
            });
        }

        // Generate thumbs if needed
        if (isset($settings['preview_images']) && $settings['preview_images'] === true) {
            foreach ($available_files as $filename) {
                $thumbs[$filename] = $media[$filename]->zoomCrop(100,100)->url();
            }
        }

        $this->admin->json_response = [
            'status'  => 'success',
            'files'   => array_values($available_files),
            'pending' => array_values($pending_files),
            'folder'  => $folder,
            'metadata' => $metadata,
            'thumbs' => $thumbs
        ];

        return true;
    }

    /**
     * @param string $file
     * @param array $settings
     * @return false
     */
    protected function filterAcceptedFiles($file, $settings)
    {
        $valid = false;

        foreach ((array)$settings['accept'] as $type) {
            $find = str_replace('*', '.*', $type);
            $valid |= preg_match('#' . $find . '$#i', $file);
        }

        return $valid;
    }

    /**
     * Handle deleting a file from a blueprint
     *
     * @return bool True if the action was performed.
     */
    protected function taskRemoveFileFromBlueprint()
    {
        if (!$this->authorizeTask('remove file', $this->dataPermissions())) {
            return false;
        }

        /** @var Uri $uri */
        $uri       = $this->grav['uri'];
        $blueprint = base64_decode($uri->param('blueprint'));
        $path      = base64_decode($uri->param('path'));
        $route     = base64_decode($uri->param('proute'));
        $type      = $uri->param('type');
        $field     = $uri->param('field');

        $filename  = Utils::basename($this->post['filename'] ?? '');
        if ($filename === '') {
           $this->admin->json_response = [
                'status'  => 'error',
                'message' => 'Filename is empty'
            ];

            return false;
        }

        // Get Blueprint
        if ($type === 'pages' || strpos($blueprint, 'pages/') === 0) {
            $page = $this->admin->page(true, $route);
            if (!$page) {
                $this->admin->json_response = [
                    'status'  => 'error',
                    'message' => 'Page not found'
                ];

                return false;
            }
            $blueprints = $page->blueprints();
            $path = Folder::getRelativePath($page->path());
            $settings = (object)$blueprints->schema()->getProperty($field);
        } else {
            $page = null;
            if ($type === 'themes' || $type === 'plugins') {
                $obj = $this->grav[$type]->get(Utils::substrToString($blueprint, '/')); //here
                $settings = (object) $obj->blueprints()->schema()->getProperty($field);
            } else {
                $settings = (object)$this->admin->blueprints($blueprint)->schema()->getProperty($field);
            }
        }

        // Get destination
        if ($this->grav['locator']->isStream($settings->destination)) {
            $destination = $this->grav['locator']->findResource($settings->destination, false, true);

        } else {
            $destination = Folder::getRelativePath(rtrim($settings->destination, '/'));
            $destination = $this->admin->getPagePathFromToken($destination, $page);
        }

        // Not in path
        if (!Utils::startsWith($path, $destination)) {
            $this->admin->json_response = [
                'status'  => 'error',
                'message' => 'Path not valid for this data type'
            ];

            return false;
        }

        // Only remove files from correct destination...
        $this->taskRemoveMedia($destination . '/' . $filename);

        if ($page) {
            $keys = explode('.', preg_replace('/^header./', '', $field));
            $header = (array)$page->header();
            $data_path = implode('.', $keys);
            $data = Utils::getDotNotation($header, $data_path);

            if (isset($data[$path])) {
                unset($data[$path]);
                Utils::setDotNotation($header, $data_path, $data);
                $page->header($header);
            }

            $page->save();
        } elseif ($type === 'user') {
            $user = Grav::instance()['user'];
            unset($user->avatar);
            $user->save();
        } else {

            $blueprint_prefix = $type === 'config' ? '' : $type . '.';
            $blueprint_name   = str_replace(['config/', '/blueprints'], '', $blueprint);
            $blueprint_field  = $blueprint_prefix . $blueprint_name . '.' . $field;

            $files            = $this->grav['config']->get($blueprint_field);

            if ($files) {
                foreach ($files as $key => $value) {
                    if ($key == $path) {
                        unset($files[$key]);
                    }
                }
            }

            $this->grav['config']->set($blueprint_field, $files);

            switch ($type) {
                case 'config':
                    $data   = $this->grav['config']->get($blueprint_name);
                    $config = $this->admin->data($blueprint, $data);
                    $config->save();
                    break;
                case 'themes':
                    Theme::saveConfig($blueprint_name);
                    break;
                case 'plugins':
                    Plugin::saveConfig($blueprint_name);
                    break;
            }
        }

        Cache::clearCache('invalidate');

        $this->admin->json_response = [
            'status'  => 'success',
            'message' => $this->admin::translate('PLUGIN_ADMIN.REMOVE_SUCCESSFUL')
        ];

        return true;
    }

    /**
     * Handles removing a media file
     *
     * @note This task cannot be used anymore.
     *
     * @return bool True if the action was performed
     */
    public function taskRemoveMedia($filename = null)
    {
        if (!$this->canEditMedia()) {
            return false;
        }

        if (null === $filename) {
            throw new \RuntimeException('Admin task RemoveMedia has been disabled.');
        }

        $file                  = File::instance($filename);
        $resultRemoveMedia     = false;

        if ($file->exists()) {
            $resultRemoveMedia = $file->delete();

            $fileParts = Utils::pathinfo($filename);

            foreach (scandir($fileParts['dirname']) as $file) {
                $regex_pattern = '/' . preg_quote($fileParts['filename'], '/') . "@\d+x\." . $fileParts['extension'] . "(?:\.meta\.yaml)?$|" . preg_quote($fileParts['basename'], '/') . "\.meta\.yaml$/";
                if (preg_match($regex_pattern, $file)) {
                    $path = $fileParts['dirname'] . '/' . $file;
                    @unlink($path);
                }
            }

        }

        if ($resultRemoveMedia) {
            if ($this->grav['uri']->extension() === 'json') {
                $this->admin->json_response = [
                    'status'  => 'success',
                    'message' => $this->admin::translate('PLUGIN_ADMIN.REMOVE_SUCCESSFUL')
                ];
            } else {
                $this->admin->setMessage($this->admin::translate('PLUGIN_ADMIN.REMOVE_SUCCESSFUL'), 'info');
                $this->clearMediaCache();
                $this->setRedirect('/media-manager');
            }

            return true;
        }

        if ($this->grav['uri']->extension() === 'json') {
            $this->admin->json_response = [
                'status'  => 'success',
                'message' => $this->admin::translate('PLUGIN_ADMIN.REMOVE_FAILED')
            ];
        } else {
            $this->admin->setMessage($this->admin::translate('PLUGIN_ADMIN.REMOVE_FAILED'), 'error');
        }

        return false;
    }

    /**
     * Handles clearing the media cache
     *
     * @return bool True if the action was performed
     */
    protected function clearMediaCache()
    {
        $key   = 'media-manager-files';
        $cache = $this->grav['cache'];
        $cache->delete(md5($key));

        return true;
    }

    /**
     * Determine if the user can edit media
     *
     * @param string $type
     *
     * @return bool True if the media action is allowed
     */
    protected function canEditMedia($type = 'media')
    {
        if (!$this->authorizeTask('edit media', ['admin.' . $type, 'admin.super'])) {
            return false;
        }

        return true;
    }

    /**
     * @param string $message
     * @param string $type
     * @return $this
     */
    protected function setMessage($message, $type = 'info')
    {
        $this->admin->setMessage($message, $type);

        return $this;
    }

    /**
     * @return Config
     */
    protected function getConfig(): Config
    {
        return $this->grav['config'];
    }

    /**
     * @return ServerRequestInterface
     */
    protected function getRequest(): ServerRequestInterface
    {
        return $this->grav['request'];
    }
}
