import chai from 'chai';
import <%= varName %> from '../src';

const expect = chai.expect;

describe('<%= name %> tests', function() {

  it('works', function() {
    expect(<%= varName %>()).to.equal('stuff');
  });

});
