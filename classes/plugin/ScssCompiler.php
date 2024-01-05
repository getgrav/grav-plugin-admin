<?php

/**
 * @package    Grav\Plugin\Admin
 *
 * @copyright  Copyright (c) 2015 - 2024 Trilby Media, LLC. All rights reserved.
 * @license    MIT License; see LICENSE file for details.
 */

namespace Grav\Plugin\Admin;

use ScssPhp\ScssPhp\Compiler;
use ScssPhp\ScssPhp\ValueConverter;

class ScssCompiler
{
    protected $compiler;

    public function compiler()
    {
        if ($this->compiler === null) {
            $this->reset();
        }
        return $this->compiler;
    }

    public function reset()
    {
        $this->compiler = new Compiler();
        return $this;
    }

    public function setVariables(array $variables)
    {
//        $parsed = ValueConverter::fromPhp($variables);
        $parsed = [];
        foreach ($variables as $key => $value) {
            $parsed[$key] = ValueConverter::parseValue($value);
        }

        $this->compiler()->addVariables($parsed);
        return $this;
    }

    public function setImportPaths(array $paths)
    {
        $this->compiler()->setImportPaths($paths);
        return $this;
    }

    public function compile(string $input_file, string $output_file)
    {
        $input = file_get_contents($input_file);
        $output = $this->compiler()->compile($input);
        file_put_contents($output_file, $output);
        return $this;
    }

    public function compileAll(array $input_paths, string $output_file)
    {
        $input = '';
        foreach ($input_paths as $input_file) {
            $input .= trim(file_get_contents($input_file)) . "\n\n";
        }
        $output = $this->compiler()->compileString($input)->getCss();
        file_put_contents($output_file, $output);
        return $this;
    }

}
