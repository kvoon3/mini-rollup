const bar = 'bar'

function one() {
  const foo = 'foo'
  function two() {
    const foo = 'foo'
    function three() {
      const baz = 'baz'
    }
  }
}
