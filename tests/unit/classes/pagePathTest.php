<?php

namespace Grav\Plugin;

use Grav\Plugin\Admin\Utils;

/**
 * Page folders, routes and picker paths must stay inside the pages folder.
 */
class PagePathTest extends \Codeception\TestCase\Test
{
    private $root;

    protected function _before()
    {
        require_once __DIR__ . '/../../../classes/plugin/Utils.php';

        $this->root = sys_get_temp_dir() . '/admin-page-path-' . uniqid('', true);
        mkdir($this->root . '/user/pages/blog', 0777, true);
        mkdir($this->root . '/outside', 0777, true);
    }

    protected function _after()
    {
        @rmdir($this->root . '/user/pages/blog');
        @rmdir($this->root . '/user/pages');
        @rmdir($this->root . '/user');
        @rmdir($this->root . '/outside');
        @rmdir($this->root);
    }

    public function testFolderNamesAreSingleSegments()
    {
        $this->assertTrue(Utils::isValidPageFolder('blog'));
        $this->assertTrue(Utils::isValidPageFolder('v1.2-notes'));

        foreach (['', '.', '..', '../../tmp/evil', '..\\..\\tmp', 'a/b', "a\0b", null, ['x']] as $bad) {
            $this->assertFalse(Utils::isValidPageFolder($bad), var_export($bad, true));
        }
    }

    public function testRoutesWithDotSegmentsAreRefused()
    {
        $this->assertFalse(Utils::routeHasDotSegment('/blog/my.post'));
        $this->assertFalse(Utils::routeHasDotSegment('/blog/...'));

        foreach (['/../../backup', '/blog/..', '..', '/./blog', '/blog\\..\\x', "/blog\0"] as $bad) {
            $this->assertTrue(Utils::routeHasDotSegment($bad), $bad);
        }
    }

    public function testPickerPathsStayInsideThePagesFolder()
    {
        $pages = $this->root . '/user/pages';

        $this->assertTrue(Utils::isPathInside($pages, $pages));
        $this->assertTrue(Utils::isPathInside($pages . '/blog', $pages));
        $this->assertFalse(Utils::isPathInside($pages . '/../../outside', $pages));
        $this->assertFalse(Utils::isPathInside($this->root . '/user', $pages));
        $this->assertFalse(Utils::isPathInside($pages . '/missing', $pages));
    }
}
