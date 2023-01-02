<?php
namespace Grav\Plugin\Admin;

/**
 * @package    Grav\Plugin\Admin
 *
 * @copyright  Copyright (c) 2015 - 2023 Trilby Media, LLC. All rights reserved.
 * @license    MIT License; see LICENSE file for details.
 */

use Grav\Common\Filesystem\Folder;
use Grav\Common\Grav;
use Grav\Framework\File\File;
use RocketTheme\Toolbox\Event\Event;
use RocketTheme\Toolbox\ResourceLocator\UniformResourceLocator;
use Symfony\Component\Yaml\Yaml;

class WhiteLabel
{
    protected $grav;
    protected $scss;

    public function __construct()
    {
        $this->grav = Grav::instance();
        $this->scss = new ScssCompiler();
    }

    public function compilePresetScss($config, $options = [
            'input' => 'plugin://admin/themes/grav/scss/preset.scss',
            'output' => 'asset://admin-preset.css'
        ])
    {
        if (is_array($config)) {
            $color_scheme   = $config['color_scheme'];
        } else {
            $color_scheme   = $config->get('whitelabel.color_scheme');
        }

        if ($color_scheme) {
            /** @var UniformResourceLocator $locator */
            $locator       = $this->grav['locator'];

            // Use ScssList object to make it easier ot handle in event
            $scss_list     = new ScssList($locator->findResource($options['input']));
            $output_css    = $locator->findResource(($options['output']), true, true);

            Folder::create(dirname($output_css));

            Grav::instance()->fireEvent('onAdminCompilePresetSCSS', new Event(['scss' => $scss_list]));

            // Convert bak to regular array now we have run the event
            $input_scss = $scss_list->all();

            $imports = [$locator->findResource('plugin://admin/themes/grav/scss')];
            foreach ($input_scss as $scss) {
                $input_path = dirname($scss);
                if (!in_array($input_path, $imports)) {
                    $imports[] = $input_path;
                }
            }

            try {
                $compiler = $this->scss->reset();

                $compiler->setVariables($color_scheme['colors'] + $color_scheme['accents']);
                $compiler->setImportPaths($imports);
                $compiler->compileAll($input_scss, $output_css);
            } catch (\Exception $e) {
                return [false, $e->getMessage()];
            }


            return [true, 'Recompiled successfully'];

        }
        return [false, ' Could not be recompiled, missing color scheme...'];
    }

    public function exportPresetScsss($config, $location = 'asset://admin-theme-export.yaml')
    {

        if (isset($config['color_scheme'])) {

            $color_scheme = $config['color_scheme'];

            $body = Yaml::dump($color_scheme);

            $file = new File($location);
            $file->save($body);
            // todo: handle errors/exceptions?

            return [true, 'File created successfully'];

        } else {
            return [false, ' Could not export, missing color scheme...'];
        }
    }

}
