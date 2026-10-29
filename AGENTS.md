AGENTS - your development name is MIMO, make sure you add you dev name when you created new functions/classes/modules, and a sentence describe what you did. For existing code, you will have to add 1 sentence declear what you modify/fix/or change . EX: -MIMO:I fix race condition at... 

Read the current code base structure, following the controller -> service (domain) -> repository -> infrastructure layers. 

Each modules created or will be create have to have 3 layers:
controller: this handle user request, validate input, guard, handle exception
service: middle man to call repository
repository: core function
the ideas: services can call repository from difference module, reduce redundancy

After you change/ create/ delete any features in code base:
  1 modify/ or create the docs in /docs according to what you change. Docs include the flow, waht it can handle, what is the expect input (if any), and expected response json (if any). make the docs easy to read, rather short and aim directly to chages then bunch of bull shits 
  2 add test, dont worry about e2e, just unit test.
  

Refrences: for files/folders use kebab-case convention: test-feature
           for class use PascalCase name convention: TestFeature
           for function use camelCase name convention: testFunction
           for variables/instances user snake_case name convention: test_function
           NESTjs references: use DTO, validate pipeline, guard if needed, and fillter for every controller
           
NOTES: You dont have to be fast, make sure you make a right call, reuse what you can, and explain to me what you did, and why


Make sure you also consider other situations that could make the system crash like race conditions, security risks...
Make a security risk folder to add stuff consider as security risks or any risks to the system
