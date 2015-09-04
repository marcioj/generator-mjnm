import chai from 'chai';
import <%= varName %> from '../lib';

const expect = chai.expect;

describe('<%= name %> tests', function() {

  it('works', function() {
    expect(<%= varName %>()).to.equal('stuff');
  });

});
