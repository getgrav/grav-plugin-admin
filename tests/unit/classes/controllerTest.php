<?php

namespace Grav\Plugin;

/**
 * Class ControllerTest
 */
class ControllerTest extends \Codeception\TestCase\Test
{
    protected $controller;


    protected function _before()
    {
        require_once(__DIR__ . '/../../../classes/adminbasecontroller.php');
        require_once(__DIR__ . '/../../../classes/admincontroller.php');
        $this->controller = new \Grav\Plugin\Admin\AdminController();
    }

    protected function _after()
    {

    }

    public function testDetermineFilenameIncludingLanguage()
    {
        $language = 'en-GB';

        $this->assertSame('testing.en-GB.md', $this->controller->determineFilenameIncludingLanguage('testing.md', $language));
        $this->assertSame('testing.en-GB.md', $this->controller->determineFilenameIncludingLanguage('testing.en.md', $language));
        $this->assertSame('testing.en-GB.md', $this->controller->determineFilenameIncludingLanguage('testing.it.md', $language));
        $this->assertSame('testing.en-GB.md', $this->controller->determineFilenameIncludingLanguage('testing.en-GB.md', $language));

        $language = 'it';

        $this->assertSame('testing.it.md', $this->controller->determineFilenameIncludingLanguage('testing.md', $language));
        $this->assertSame('testing.it.md', $this->controller->determineFilenameIncludingLanguage('testing.en.md', $language));
        $this->assertSame('testing.it.md', $this->controller->determineFilenameIncludingLanguage('testing.it.md', $language));
        $this->assertSame('testing.it.md', $this->controller->determineFilenameIncludingLanguage('testing.en-GB.md', $language));
    }

    /**
     * GHSA-wx62 regression: tool-managed config scopes (scheduler, backups)
     * must resolve to super-only permissions, never the inheritable
     * admin.configuration.* that a non-super configuration admin can hold.
     * The scheduler scope writes custom_jobs[].command into a Symfony Process,
     * so an inheritable grant there is an escalation to command execution.
     */
    public function testSchedulerConfigScopeIsSuperOnly()
    {
        $perms = $this->dataPermissionsFor('config', 'scheduler');
        $this->assertSame(['admin.super'], $perms);
        $this->assertNotContains('admin.configuration.scheduler', $perms);
    }

    public function testBackupsConfigScopeIsSuperOnly()
    {
        $this->assertSame(['admin.super'], $this->dataPermissionsFor('config', 'backups'));
    }

    public function testOrdinaryConfigScopeStillUsesInheritablePermission()
    {
        // Non-privileged config scopes must keep working for configuration admins.
        $perms = $this->dataPermissionsFor('config', 'system');
        $this->assertContains('admin.configuration.system', $perms);
    }

    private function dataPermissionsFor($view, $route)
    {
        $this->controller->view = $view;
        $this->controller->route = $route;

        $method = new \ReflectionMethod($this->controller, 'dataPermissions');
        $method->setAccessible(true);

        return $method->invoke($this->controller);
    }
}

