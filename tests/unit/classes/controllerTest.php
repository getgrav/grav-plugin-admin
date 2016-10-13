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
        require_once(__DIR__ . '/../../../classes/controller.php');
        $this->controller = new AdminController();
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
}

