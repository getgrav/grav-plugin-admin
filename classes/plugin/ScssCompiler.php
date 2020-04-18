<?php
namespace Grav\Plugin\Admin;

use ScssPhp\ScssPhp\Compiler;

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

    public function setVariables($variables)
    {
        $this->compiler()->setVariables($variables);
        return $this;
    }

    public function setImportPaths($paths)
    {
        $this->compiler()->setImportPaths($paths);
        return $this;
    }

    public function compile($input_file, $output_file)
    {
        $input = file_get_contents($input_file);
        $output = $this->compiler()->compile($input);
        file_put_contents($output_file, $output);
        return $this;
    }

}
