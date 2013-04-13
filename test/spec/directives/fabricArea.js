'use strict';

describe('Directive: fabricArea', function () {
  beforeEach(module('designmeApp'));

  var element;

  it('should make hidden element visible', inject(function ($rootScope, $compile) {
    element = angular.element('<fabric-area></fabric-area>');
    element = $compile(element)($rootScope);
    expect(element.text()).toBe('this is the fabricArea directive');
  }));
});
