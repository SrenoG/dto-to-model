Mainly used for my company, but can be used for your Angular project if yours models, Dto's or Enum match.

See tests/assets/results folder to check what you can expect as output.

For some Type like Date/Enum, this generator use specific method, new features must provide configuration file for custom results.

Model generator from OpenApi Dto's

Can generate Models, specs, Mocks or Enum

Exposed Methods:

generateModel

generateMocks

generateSpecs

generateEnum

Check into tests/results folder what kind of generation you can expect from tests/dtos files.

You have to use it into node_module OpenApi generated API folder to found all related Dto's and populate specs and mocks.

Need -dto.d.ts or -dto.ts files as interface from OpenApiGenerator, array declared as Array<T>

It's a BETA actually, need some improvement and cleaning code

See https://github.com/SrenoG/dto-to-model-vscode to use it in vscode extension
