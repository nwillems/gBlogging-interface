SOY_PATH     = ~/Code/html_js/closure/templates/SoyToJsSrcCompiler.jar
CLOSURE_PATH = ~/Code/html_js/closure/compiler/compiler.jar
SOYJS        = java -jar $(SOY_PATH)
CLOSURE		 = java -jar $(CLOSURE_PATH)

def: all

template: templates/templates.soy 
	$(SOYJS) --outputPathFormat templates/templates.js templates/templates.soy

compile: templates/templates.js
	$(CLOSURE) --js templates/templates.js --js_output_file templates/templates.min.js

upload:
	scp -r ./ nwillems@nwillems.dk:/var/www/blogging

all: template compile upload


