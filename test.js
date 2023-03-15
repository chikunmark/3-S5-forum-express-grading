// const bbb = b => b * b

function test2 (fn) {
  console.log('改版後')
  return console.log(fn(10))
}
test2(tt => tt * tt)

function add (a) {
  return a * a
}

function test (fn) {
  console.log('改版前')
  return console.log(fn(10))
}

test(add)
