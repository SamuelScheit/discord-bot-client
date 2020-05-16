const req = webpackJsonp.push([
	[],
	{ __extra_id__: (module, exports, req) => (module.exports = req) },
	[["__extra_id__"]],
]);
delete req.m.__extra_id__;
delete req.c.__extra_id__;
const find = (filter) => {
	for (const i in req.c) {
		if (req.c.hasOwnProperty(i)) {
			const m = req.c[i].exports;
			if (m && m.__esModule && m.default && filter(m.default)) return m.default;
			if (m && filter(m)) return m;
		}
	}
	// console.warn("Cannot find loaded module in cache");
	return null;
};

const findAll = (filter) => {
	const modules = [];
	for (const i in req.c) {
		if (req.c.hasOwnProperty(i)) {
			const m = req.c[i].exports;
			if (m && m.__esModule && m.default && filter(m.default)) modules.push(m.default);
			else if (m && filter(m)) modules.push(m);
		}
	}
	return modules;
};

const findByProps = (...propNames) => find((module) => propNames.every((prop) => module[prop] !== undefined));
const findByPrototypes = (...protoNames) =>
	find((module) => module.prototype && protoNames.every((protoProp) => module.prototype[protoProp] !== undefined));
const findByDisplayName = (displayName) => find((module) => module.displayName === displayName);

// window.WebpackModules = { find, findAll, findByProps, findByPrototypes, findByDisplayName };

window.req = webpackJsonp.push([[], {
    '__extra_id__': (module, exports, req) => module.exports = req
}, [['__extra_id__']]]);
delete req.m['__extra_id__'];
delete req.c['__extra_id__'];

window.findModule = (module, silent) => {
    for (let i in req.c) {
        if (req.c.hasOwnProperty(i)) {
            let m = req.c[i].exports;
            if (m && m.__esModule && m.default && m.default[module] !== undefined)
                return m.default;
            if (m && m[module] !== undefined)
                return m;
        }
    }
    return null;
};
window.findModules = (module) => {
    let mods = [];
    for (let i in req.c) {
        if (req.c.hasOwnProperty(i)) {
            let m = req.c[i].exports;
            if (m && m.__esModule && m.default && m.default[module] !== undefined)
                mods.push(m.default);
            if (m && m[module] !== undefined)
                mods.push(m);
        }
    }
    return mods;
};
window.findRawModule = (module, silent) => {
    for (let i in req.c) {
        if (req.c.hasOwnProperty(i)) {
            let m = req.c[i].exports;
            if (m && m.__esModule && m.default && m.default[module] !== undefined)
                return req.c[i];
            if (m && m[module] !== undefined)
                return req.c[i];
        }
    }
    return null;
};
window.monkeyPatch = function(what, methodName, newFunc) {
    if (!what || typeof what !== 'object')
        return false;
    const displayName = what.displayName || what.name || what.constructor.displayName || what.constructor.name;
    const origMethod = what[methodName];
    const cancel = () => {
        what[methodName] = origMethod;
        return true;
    };
    what[methodName] = function() {
        const data = {
            thisObject: this,
            methodArguments: arguments,
            originalMethod: origMethod,
            callOriginalMethod: () => data.returnValue = data.originalMethod.apply(data.thisObject, data.methodArguments)
        };
        return newFunc(data);
    };
    what[methodName].__monkeyPatched = true;
    what[methodName].displayName = 'patched ' + (what[methodName].displayName || methodName);
    what[methodName].unpatch = cancel;
    return true;
};
