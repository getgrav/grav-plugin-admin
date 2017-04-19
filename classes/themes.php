<?php
namespace Grav\Plugin\Admin;

/**
 * Admin theme object
 *
 * @author  RocketTheme
 * @license MIT
 */
class Themes extends \Grav\Common\Themes
{
    public function init()
    {
        /** @var Themes $themes */
        $themes = $this->grav['themes'];
        $themes->configure();

        $this->grav->fireEvent('onAdminThemeInitialized');
    }
}
