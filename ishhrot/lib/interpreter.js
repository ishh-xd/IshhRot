class IshhrotInterpreter {
    constructor() {
        this.variables = {};
        this.functions = {};
    }

    execute(code) {
        const lines = code.split("\n").map(line => line.trim());
        let i = 0;

        while (i < lines.length) {
            let line = lines[i];
            if (line === "" || line.startsWith("#")) {
                i++;
                continue; // Skip empty lines and comments
            }

            if (line.startsWith("let")) {
                this.declareVariable(line);
            } else if (line.startsWith("print")) {
                this.print(line);
            } else if (line.startsWith("function")) {
                i = this.defineFunction(lines, i);
            } else if (line.includes("(") && line.includes(")")) {
                this.executeFunction(line);
            } else {
                console.error(`Unknown command: ${line}`);
            }
            i++;
        }
    }

    declareVariable(line) {
        const match = line.match(/let (\w+) be (.+);/);
        if (!match) throw new Error(`Invalid variable declaration: ${line}`);
        const [_, varName, expression] = match;
        this.variables[varName] = this.evaluateExpression(expression);
    }

    print(line) {
        const match = line.match(/print (.+);/);
        if (!match) throw new Error(`Invalid print statement: ${line}`);
        const toPrint = match[1];
        if (toPrint.startsWith('"') && toPrint.endsWith('"')) {
            console.log(toPrint.slice(1, -1)); // Strip quotes
        } else {
            console.log(this.variables[toPrint] || `Undefined variable: ${toPrint}`);
        }
    }

    defineFunction(lines, index) {
        const headerMatch = lines[index].match(/function (\w+)(.*) {/);
        if (!headerMatch) throw new Error(`Invalid function declaration: ${lines[index]}`);
        const [_, functionName, args] = headerMatch;
        const argNames = args.split(",").map(arg => arg.trim());

        const body = [];
        let openBraces = 1;
        index++;

        while (index < lines.length && openBraces > 0) {
            const line = lines[index].trim();
            if (line === "{") openBraces++;
            else if (line === "}") openBraces--;
            else if (openBraces > 0) body.push(line);
            index++;
        }

        this.functions[functionName] = { argNames, body };
        return index - 1;
    }

    executeFunction(line) {
        const match = line.match(/(\w+)(.*);/);
        if (!match) throw new Error(`Invalid function call: ${line}`);
        const [_, functionName, args] = match;

        const func = this.functions[functionName];
        if (!func) throw new Error(`Undefined function: ${functionName}`);

        const argValues = args.split(",").map(arg => this.evaluateExpression(arg.trim()));
        const localVariables = { ...this.variables };

        func.argNames.forEach((argName, i) => {
            this.variables[argName] = argValues[i];
        });

        func.body.forEach(bodyLine => this.execute(bodyLine));

        this.variables = localVariables; // Restore variables
    }

    evaluateExpression(expression) {
        try {
            return Function("variables", `with(variables) { return (${expression}); }`)(
                this.variables
            );
        } catch (e) {
            console.error(`Error evaluating expression: ${expression}`);
            return undefined;
        }
    }
}

module.exports = IshhrotInterpreter;
