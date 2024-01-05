<?php

/**
 * @package    Grav\Plugin\Admin
 *
 * @copyright  Copyright (c) 2015 - 2024 Trilby Media, LLC. All rights reserved.
 * @license    MIT License; see LICENSE file for details.
 */

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
        $themes->initTheme();

        $this->grav->fireEvent('onAdminThemeInitialized');
    }
}
