const test = require('ava')
const AABBDD = require('../dist/index.js')
const {Vector2D} = require('friendly-vectors')

test.beforeEach((t) => {
    t.c = t.context
    t.c.cx = Math.random()
    t.c.cy = Math.random()
    t.c.ex = Math.random()
    t.c.ey = Math.random()
})

/* eslint-disable no-new */
test('AABBDD throws when passed nothing.', (t) => {
    t.throws(() => {
        new AABBDD()
    }, TypeError)
})

test('AABBDD throws when passed non object.', (t) => {
    t.throws(() => {
        new AABBDD('a')
    }, TypeError)
})

test('AABBDD throws when passed object with wrong args.', (t) => {
    t.throws(() => {
        new AABBDD({
            center: 'asdf',
            foo: 'asdf',
        })
    }, TypeError)
})

test('AABBDD constructor accepts object with proper args.', (t) => {
    let box = new AABBDD({
        center: {
            x: 5,
            y: 3,
        },
        extents: {
            x: 2,
            y: 1,
        },
    })

    t.true(box.center.x === 5)
    t.true(box.center.y === 3)
    t.true(box.extents.x === 2)
    t.true(box.extents.y === 1)
})

test('AABBDD constructor accepts instances of Vector2D.', (t) => {
    let box = new AABBDD({
        center: new Vector2D(5, 3),
        extents: new Vector2D(2, 1),
    })

    t.true(box.center.x === 5)
    t.true(box.center.y === 3)
    t.true(box.extents.x === 2)
    t.true(box.extents.y === 1)
})

test('AABBDD constructor accepts instances of AABBDD.', (t) => {
    let {cx, cy, ex, ey} = t.context

    let box1 = new AABBDD({
        center: new Vector2D(cx, cy),
        extents: new Vector2D(ex, ey),
    })

    let box2 = new AABBDD(box1)

    t.true(box2.center.x === cx)
    t.true(box2.center.y === cy)
    t.true(box2.extents.x === ex)
    t.true(box2.extents.y === ey)
})

test('AABBDD constructor aliases .translate() as .offset().', (t) => {
    let {cx, cy, ex, ey} = t.context

    let box = new AABBDD({
        center: new Vector2D(cx, cy),
        extents: new Vector2D(ex, ey),
    })

    t.true(box.offset === box.translate)
})

test('AABBDD constructor aliases .combine() as .enclose().', (t) => {
    let {cx, cy, ex, ey} = t.context

    let box = new AABBDD({
        center: new Vector2D(cx, cy),
        extents: new Vector2D(ex, ey),
    })

    t.true(box.enclose === box.combine)
})

test('AABBDD constructor aliases .containsAABB() as .containsAABBDD().', (t) => {
    let {cx, cy, ex, ey} = t.context

    let box = new AABBDD({
        center: new Vector2D(cx, cy),
        extents: new Vector2D(ex, ey),
    })

    t.true(box.containsAABBDD === box.containsAABB)
})

// Testing .support()

test('AABBDD.prototype.support() throws when argument is not an instance of Vector2D.', (t) => {
    let {cx, cy, ex, ey} = t.context

    let box = new AABBDD({
        center: new Vector2D(cx, cy),
        extents: new Vector2D(ex, ey),
    })

    t.throws(() => {
        box.support({})
    }, TypeError)
})

test('AABBDD.prototype.support() throws when argument is the zero vector.', (t) => {
    let {cx, cy, ex, ey} = t.context

    let box = new AABBDD({
        center: new Vector2D(cx, cy),
        extents: new Vector2D(ex, ey),
    })

    t.throws(() => {
        box.support(new Vector2D())
    }, RangeError)
})

test('AABBDD.prototype.support() returns the center when extents is the zero vector.', (t) => {
    let {cx, cy} = t.context

    let box = new AABBDD({
        center: new Vector2D(cx, cy),
        extents: new Vector2D(0, 0),
    })

    let support = box.support(new Vector2D(5, 3))
    t.true(box.center.equals(support))
})

test('AABBDD.prototype.support() proper vertex.', (t) => {
    let {cx, cy, ex, ey} = t.context

    let box = new AABBDD({
        center: new Vector2D(cx, cy),
        extents: new Vector2D(ex, ey),
    })

    let support = box.support(new Vector2D(1, 1))
    t.true(support.x === cx + ex)
    t.true(support.y === cy + ey)

    support = box.support(new Vector2D(1, -1))
    t.true(support.x === cx + ex)
    t.true(support.y === cy - ey)

    support = box.support(new Vector2D(-1, -1))
    t.true(support.x === cx - ex)
    t.true(support.y === cy - ey)

    support = box.support(new Vector2D(-1, 1))
    t.true(support.x === cx - ex)
    t.true(support.y === cy + ey)
})

test('AABBDD.prototype.support() proper vertex.', (t) => {
    let {cx, cy, ex, ey} = t.context

    let box = new AABBDD({
        center: new Vector2D(cx, cy),
        extents: new Vector2D(ex, ey),
    })

    let support = box.support(new Vector2D(1, 1))
    t.true(support.x === cx + ex)
    t.true(support.y === cy + ey)

    support = box.support(new Vector2D(1, -1))
    t.true(support.x === cx + ex)
    t.true(support.y === cy - ey)

    support = box.support(new Vector2D(-1, -1))
    t.true(support.x === cx - ex)
    t.true(support.y === cy - ey)

    support = box.support(new Vector2D(-1, 1))
    t.true(support.x === cx - ex)
    t.true(support.y === cy + ey)
})

test('AABBDD.prototype.support() doesn\'t return a reference to extents.', (t) => {
    let {cx, cy, ex, ey} = t.context

    let box = new AABBDD({
        center: new Vector2D(cx, cy),
        extents: new Vector2D(ex, ey),
    })

    let support = box.support(new Vector2D(1, 1))
    t.true(support !== box.extents)
})

test('AABBDD.prototype.assertVectorLike() throws if an object has the wrong keys.', (t) => {
    let {cx, cy, ex, ey} = t.context

    let box = new AABBDD({
        center: new Vector2D(cx, cy),
        extents: new Vector2D(ex, ey),
    })

    t.throws(() => {
        box.assertVectorLike({x: 'a'})
    }, TypeError)

    t.throws(() => {
        box.assertVectorLike({x: 'y'})
    }, TypeError)
})

test('AABBDD.prototype.assertVectorLike() doesn\'t throw passed if an empty object.', (t) => {
    let {cx, cy, ex, ey} = t.context

    let box = new AABBDD({
        center: new Vector2D(cx, cy),
        extents: new Vector2D(ex, ey),
    })

    t.notThrows(() => {
        box.assertVectorLike({})
    }, TypeError)
})

test('AABBDD.prototype.assertVectorLike() throws if an array has the wrong values.', (t) => {
    let {cx, cy, ex, ey} = t.context

    let box = new AABBDD({
        center: new Vector2D(cx, cy),
        extents: new Vector2D(ex, ey),
    })

    t.throws(() => {
        box.assertVectorLike(['a', {}])
    }, TypeError)

    t.throws(() => {
        box.assertVectorLike([0, []])
    }, TypeError)
})

test('AABBDD.prototype.assertVectorLike() doesn\'t throw if passed an empty array.', (t) => {
    let {cx, cy, ex, ey} = t.context

    let box = new AABBDD({
        center: new Vector2D(cx, cy),
        extents: new Vector2D(ex, ey),
    })

    t.notThrows(() => {
        box.assertVectorLike([])
    }, TypeError)
})

test('AABBDD.prototype.assertVectorLike() throws if passed non numbers.', (t) => {
    let {cx, cy, ex, ey} = t.context

    let box = new AABBDD({
        center: new Vector2D(cx, cy),
        extents: new Vector2D(ex, ey),
    })

    t.throws(() => {
        box.assertVectorLike('a', 5)
    }, TypeError)

    t.throws(() => {
        box.assertVectorLike(null, new RegExp('a'))
    }, TypeError)
})

test('AABBDD.prototype.translate() defaults to x = 0 and y = 0.', (t) => {
    let {cx, cy, ex, ey} = t.context

    let box = new AABBDD({
        center: new Vector2D(cx, cy),
        extents: new Vector2D(ex, ey),
    })

    box.translate()
    t.true(box.center.x === cx)
    t.true(box.center.y === cy)
})

test('AABBDD.prototype.translate() moves the center as expected.', (t) => {
    let {cx, cy, ex, ey} = t.context

    let box = new AABBDD({
        center: new Vector2D(cx, cy),
        extents: new Vector2D(ex, ey),
    })

    let x = Math.random()
    let y = Math.random()

    box.translate(x, y)
    t.true(box.center.x === cx + x)
    t.true(box.center.y === cy + y)
})

test('AABBDD.prototype.translate() chains.', (t) => {
    let {cx, cy, ex, ey} = t.context

    let box = new AABBDD({
        center: new Vector2D(cx, cy),
        extents: new Vector2D(ex, ey),
    })

    t.true(box.translate() === box)
})

test('AABBDD.prototype.getMin() returns an object with proper x and y.', (t) => {
    let {cx, cy, ex, ey} = t.context

    let box = new AABBDD({
        center: new Vector2D(cx, cy),
        extents: new Vector2D(ex, ey),
    })

    let min = box.getMin()
    t.true(min.x === cx - ex)
    t.true(min.y === cy - ey)
})

test('AABBDD.prototype.getMin() returns a vector with proper x and y.', (t) => {
    let {cx, cy, ex, ey} = t.context

    let box = new AABBDD({
        center: new Vector2D(cx, cy),
        extents: new Vector2D(ex, ey),
    })

    let min = box.getMin(true)
    t.true(min instanceof Vector2D)
    t.true(min.x === cx - ex)
    t.true(min.y === cy - ey)
})

test('AABBDD.prototype.getMax() returns an object with proper x and y.', (t) => {
    let {cx, cy, ex, ey} = t.context

    let box = new AABBDD({
        center: new Vector2D(cx, cy),
        extents: new Vector2D(ex, ey),
    })

    let max = box.getMax()
    t.true(max.x === cx + ex)
    t.true(max.y === cy + ey)
})

test('AABBDD.prototype.getMax() returns a vector with proper x and y.', (t) => {
    let {cx, cy, ex, ey} = t.context

    let box = new AABBDD({
        center: new Vector2D(cx, cy),
        extents: new Vector2D(ex, ey),
    })

    let max = box.getMax(true)
    t.true(max instanceof Vector2D)
    t.true(max.x === cx + ex)
    t.true(max.y === cy + ey)
})

test('AABBDD.prototype.getSize() returns an object with peroper x and y.', (t) => {
    let {cx, cy, ex, ey} = t.context

    let box = new AABBDD({
        center: new Vector2D(cx, cy),
        extents: new Vector2D(ex, ey),
    })

    let size = box.getSize()
    t.true(size.x === ex * 2)
    t.true(size.y === ey * 2)
})

test('AABBDD.prototype.getSize() returns a vector with proper x and y.', (t) => {
    let {cx, cy, ex, ey} = t.context

    let box = new AABBDD({
        center: new Vector2D(cx, cy),
        extents: new Vector2D(ex, ey),
    })

    let size = box.getSize(true)
    t.true(size instanceof Vector2D)
    t.true(size.x === ex * 2)
    t.true(size.y === ey * 2)
})

test('AABBDD.prototype.scale() defaults to x = 1 and y = 1.', (t) => {
    let {cx, cy, ex, ey} = t.context

    let box = new AABBDD({
        center: new Vector2D(cx, cy),
        extents: new Vector2D(ex, ey),
    })

    box.scale()
    t.true(box.extents.x === ex)
    t.true(box.extents.y === ey)
})

test('AABBDD.prototype.scale() scales extents expected.', (t) => {
    let {cx, cy, ex, ey} = t.context

    let box = new AABBDD({
        center: new Vector2D(cx, cy),
        extents: new Vector2D(ex, ey),
    })

    let x = Math.random()
    let y = Math.random()

    box.scale(x, y)
    t.true(box.extents.x === ex * x)
    t.true(box.extents.y === ey * y)
})

test('AABBDD.prototype.scale() chains.', (t) => {
    let {cx, cy, ex, ey} = t.context

    let box = new AABBDD({
        center: new Vector2D(cx, cy),
        extents: new Vector2D(ex, ey),
    })

    t.true(box.scale() === box)
})

test('AABBDD.prototype.expand() defaults to x = 0 and y = 0.', (t) => {
    let {cx, cy, ex, ey} = t.context

    let box = new AABBDD({
        center: new Vector2D(cx, cy),
        extents: new Vector2D(ex, ey),
    })

    box.expand()
    t.true(box.extents.x === ex)
    t.true(box.extents.y === ey)
})

test('AABBDD.prototype.expand() expands extents expected.', (t) => {
    let {cx, cy, ex, ey} = t.context

    let box = new AABBDD({
        center: new Vector2D(cx, cy),
        extents: new Vector2D(ex, ey),
    })

    let x = Math.random()
    let y = Math.random()

    box.expand(x, y)
    t.true(box.extents.x === ex + x)
    t.true(box.extents.y === ey + y)
})

test('AABBDD.prototype.expand() chains.', (t) => {
    let {cx, cy, ex, ey} = t.context

    let box = new AABBDD({
        center: new Vector2D(cx, cy),
        extents: new Vector2D(ex, ey),
    })

    t.true(box.expand() === box)
})

test('AABBDD.prototype.getArea() returns expected area.', (t) => {
    let {cx, cy, ex, ey} = t.context

    let box = new AABBDD({
        center: new Vector2D(cx, cy),
        extents: new Vector2D(ex, ey),
    })

    t.true(box.getArea() === ex * ey * 4)
})

test('AABBDD.prototype.equals() throws if no argument is passed.', (t) => {
    let {cx, cy, ex, ey} = t.context

    let box = new AABBDD({
        center: new Vector2D(cx, cy),
        extents: new Vector2D(ex, ey),
    })

    t.throws(() => {
        box.equals()
    }, TypeError)
})

test('AABBDD.prototype.equals() throws if argument is not an instance of AABBDD.', (t) => {
    let {cx, cy, ex, ey} = t.context

    let box = new AABBDD({
        center: new Vector2D(cx, cy),
        extents: new Vector2D(ex, ey),
    })

    t.throws(() => {
        box.equals(new Vector2D)
    }, TypeError)
})

test('AABBDD.prototype.equals() returns true if passed itself.', (t) => {
    let {cx, cy, ex, ey} = t.context

    let box = new AABBDD({
        center: new Vector2D(cx, cy),
        extents: new Vector2D(ex, ey),
    })

    t.true(box.equals(box))
})

test('AABBDD.prototype.equals() returns true if passed an object with similar center and extents.', (t) => {
    let {cx, cy, ex, ey} = t.context

    let box = new AABBDD({
        center: new Vector2D(cx, cy),
        extents: new Vector2D(ex, ey),
    })

    let box2 = new AABBDD({
        center: new Vector2D(cx, cy),
        extents: new Vector2D(ex, ey),
    })

    t.true(box.equals(box2))
})

test('AABBDD.prototype.equals() returns false if passed an object with different center and extents.', (t) => {
    let {cx, cy, ex, ey} = t.context

    let box = new AABBDD({
        center: new Vector2D(cx, cy),
        extents: new Vector2D(ex, ey),
    })

    let box2 = new AABBDD({
        center: new Vector2D(5, cy),
        extents: new Vector2D(ex, ey),
    })

    t.false(box.equals(box2))
})
