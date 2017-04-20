'use strict';

const fs = require('fs');
const path =require('path');

const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const expect = chai.expect;
chai.use(sinonChai);

const Base64 = require('js-base64').Base64;
const SourceMap = require('source-map');

function getActualString(name) {
  const filepath = path.resolve(__dirname, 'actual', `${name}.js`);
  const result = fs.readFileSync(filepath, 'utf-8');
  return result.toString();
} 

function getExpectJSON(name) {
  const filepath = path.resolve(__dirname, 'expect', `${name}.js`);
  const result = fs.readFileSync(filepath, 'utf-8');
  return JSON.parse(result.toString());
}

function stringifyActual(json) {
  return JSON.stringify(json, function(key, value) {
    if (typeof value === 'function') {
      value = value.toString();
    }
    return value;
  }, '  ');
}

function extractMap(actualStr) {
  const mapStr = actualStr.match(/\/\/\# sourceMappingURL=data:application\/json;charset=utf-8;base64,([0-9a-zA-Z=+\/]+)/)
  if (mapStr) {
    return JSON.parse(Base64.decode(mapStr[1]));
  }
}

describe('build', () => {
  let __jud_define__;
  let __jud_bootstrap__;
  let components;
  let requireStub;
  let bootstrapStub;

  function expectActual(name) {
    const actualStr = getActualString(name);
    const fn = new Function('__jud_define__', '__jud_bootstrap__', actualStr);
    fn(__jud_define__, __jud_bootstrap__);

    // const filepath = path.resolve(__dirname, 'expect', `${name}.js`);
    // fs.writeFileSync(filepath, stringifyActual(components), 'utf-8');

    const expectJSON = getExpectJSON(name);
    expect(JSON.parse(stringifyActual(components))).eql(expectJSON);
    expect(components).to.include.keys(__jud_bootstrap__.firstCall.args[0]);

    return actualStr;
  }

  beforeEach(() => {
    components = {};
    requireStub = sinon.stub();
    bootstrapStub = sinon.stub();

    __jud_define__ = function(componentName, deps, factory) {
      if (components[componentName]) {
        throw new Error(`${componentName} is defined repeatly`);
      }

      var __jud_require__ = requireStub;
      var __jud_exports__ = {};
      var __jud_module__ = {exports : __jud_exports__}

      factory(__jud_require__, __jud_exports__, __jud_module__)
      components[componentName] = __jud_module__.exports
    }

    __jud_bootstrap__ = bootstrapStub;

  });

  it('single template', () => {
    expectActual('a');
  });

  it('template with style', () => {
    expectActual('b');
  });

  it('template with style and script', () => {
    expectActual('c');
  });

  it('template with single inline element', () => {
    expectActual('d');
  });

  it('template with multiple inline elements', () => {
    expectActual('e');
  });

  it('parted files specifed in src', () => {
    expectActual('f');
  });

  it('component by requiring src and specifing alias', () => {
    expectActual('g');
    expect(requireStub.callCount).eql(0);
  });

  it('component under same folder', () => {
    expectActual('h');
  });

  it('template with config and data', () => {
    expectActual('i');
    expect(bootstrapStub.firstCall.args[1]).is.not.undefined;
    expect(bootstrapStub.firstCall.args[2]).is.not.undefined;
  });

  it('template and use jud module', () => {
    expectActual('j');
    expect(requireStub.callCount).eql(1);
    expect(requireStub.firstCall.args).eql(['@jud-module/modal']);
  });

  it('template by using custom language', () => {
    expectActual('k');
    expect(requireStub.callCount).eql(1);
    expect(requireStub.firstCall.args).eql(['@jud-module/modal']);
  });

  it('template and require commonjs module', () => {
    expectActual('l');
    expect(requireStub.callCount).eql(1);
    expect(requireStub.firstCall.args).eql(['@jud-module/modal']);
  });

  it('template and use jud module in commonjs module', () => {
    expectActual('m');
    expect(requireStub.callCount).eql(1);
    expect(requireStub.firstCall.args).eql(['@jud-module/modal']);
  });

  it.skip('template with sourcemap', () => {
    const actualStr = expectActual('n');
    const map = extractMap(actualStr);
    const smc = new SourceMap.SourceMapConsumer(map);

    // new Array(276).fill(0).forEach((n, i) => {
    //   i = i + 1
    //   const original = smc.originalPositionFor({
    //     line: i,
    //     column: 0
    //   })
    //   if (original.source) {
    //     console.log(i, original.line, original.source)
    //   }
    // })
  });

  it('jud examples', () => {
    expectActual('o');
  });
});