<?php
namespace Grav\Plugin\Admin;

use Grav\Common\Grav;

class Whitebox
{
    protected $grav;
    protected $scss;

    public function __construct()
    {
        $this->grav = Grav::instance();
        $this->scss = new ScssCompiler();
    }

    public function compileScss($config, $options = ['filename' => 'preset'])
    {
        if (is_array($config)) {
            $color_scheme   = $config['color_scheme'];
        } else {
            $color_scheme   = $config->get('whitebox.color_scheme');
        }

        if ($color_scheme) {

            $locator = $this->grav['locator'];

            $admin_in_base        = $locator->findResource('plugin://admin/themes/grav/scss');
            $custom_out_base      = $locator->findResource('plugin://admin/themes/grav/css-compiled');

            $preset_in_path       = $admin_in_base .'/preset.scss';
            $preset_out_path      = $custom_out_base . '/'. $options['filename'] . '.css';

            try {
                $this->compilePresetScss($color_scheme, $preset_in_path, $preset_out_path);
            } catch (\Exception $e) {
                return [false, $e->getMessage()];
            }

            return [true, 'Recompiled successfully'];

        }
        return [false, ' Could not be recompiled, missing color scheme...'];
    }

    public function compilePresetScss($colors, $in_path, $out_path)
    {
        $compiler = $this->scss->reset();

        $compiler->setVariables($colors['colors'] + $colors['accents']);
        $compiler->setImportPaths(dirname($in_path));
        $compiler->compile($in_path, $out_path);


    }

    public function colorContrast($color)
    {
        $opacity = 1;
        $RGB = [];

        if (substr($color, 0, 1) === '#') {
            $color = ltrim($color, '#');
            $RGB = [
                hexdec(substr($color, 0, 2)),
                hexdec(substr($color, 2, 2)),
                hexdec(substr($color, 4, 2))
            ];
        }

        if (substr($color, 0, 3) === 'rgb') {
            preg_match("/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)$/", $color, $matches);
            array_shift($matches);
            if (!$matches) { return $color; }

            $RGB = [$matches[0], $matches[1], $matches[3]];
            if (count($matches) === 4) {
                $opacity = $matches[3];
            }
        }

        $YIQ = (($RGB[0] * 299) + ($RGB[1] * 587) + ($RGB[2] * 114)) / 1000;
        return ($YIQ >= 128) || $opacity <= 0.50 ? 'dark' : 'light';
    }
}
