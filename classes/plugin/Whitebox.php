<?php
namespace Grav\Plugin\Admin;

use Grav\Common\Grav;
use RocketTheme\Toolbox\ResourceLocator\UniformResourceLocator;

class Whitebox
{
    protected $grav;
    protected $scss;

    public function __construct()
    {
        $this->grav = Grav::instance();
        $this->scss = new ScssCompiler();
    }

    public function compileScss($config, $options = [
            'input' => 'plugin://admin/themes/grav/scss/preset.scss',
            'output' => 'asset://admin-preset.css'
        ])
    {
        if (is_array($config)) {
            $color_scheme   = $config['color_scheme'];
        } else {
            $color_scheme   = $config->get('whitebox.color_scheme');
        }

        if ($color_scheme) {
            /** @var UniformResourceLocator $locator */
            $locator = $this->grav['locator'];

            $input_scss       = $locator->findResource($options['input']);
            $output_css      = $locator->findResource(($options['output']), true, true);

            $input_path = dirname($input_scss);
            $imports = [$locator->findResource('plugin://admin/themes/grav/scss')];
            if (!in_array($input_path, $imports)) {
                $imports[] = $input_path;
            }

            try {
                $this->compilePresetScss($color_scheme, $input_scss, $output_css, $imports);
            } catch (\Exception $e) {
                return [false, $e->getMessage()];
            }

            return [true, 'Recompiled successfully'];

        }
        return [false, ' Could not be recompiled, missing color scheme...'];
    }

    public function compilePresetScss($colors, $in_path, $out_path, $imports)
    {
        $compiler = $this->scss->reset();

        $compiler->setVariables($colors['colors'] + $colors['accents']);
        $compiler->setImportPaths($imports);
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
