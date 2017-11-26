/**
 * A class for convenient, method rich, Axis Aligned Bounding Boxes in 2D.
 * @module AABBDD
 * @todo Consider moving to .clone() and .fromArray() methods instead of overloaded constructor.
 */

// TODO: Consider moving to .clone() and .fromArray() methods instead of overloaded constructor.

const {Vector2D} = require('friendly-vectors')

/**
 * Class for representing Axis Aligned Bounding Boxes in 2D.
 */
// * @class AABBDD

class AABBDD {

    /**
     * @constructor
     * @param {Object|AABBDD}   box     An AABBDD or Object containing the center and extents of this AABBDD.
     * @throws {TypeError}              Throws if either the argument is not an object or if center or extents is not
     *                                  compatible with Vector2D.
     */
    constructor(box) {
        if (typeof box !== 'object') {
            throw new TypeError('Invalid argument.')
        }

        // Attempt to get center and extents vectors from arguments.
        let {center, extents} = box

        // If they are not instances of Vector2D convert them. Or if box is an AABBDD duplicate them.
        // If they're vectors but part of an object literal assume they're meant to be used as is.
        if (!(center instanceof Vector2D) || !(extents instanceof Vector2D) || box instanceof AABBDD) {

            if (typeof center !== 'object' || typeof extents !== 'object') {
                throw new TypeError('Invalid argument.')
            }

            center = new Vector2D(center)
            extents = new Vector2D(extents)
        }

        this.center = center
        this.extents = extents

        /**
         * @alias translate
         */
        this.offset = this.translate

        /**
         * @alias combine
         */
        this.enclose = this.combine
    }

    /**
     * Returns the point on this box furthest in the direction passed.
     * @method support
     * @param   {Vector2D}      direction       A Vector2D representing the desired support direction.
     * @throws  {TypeError}                     Throws if direction is not passed as an instance of Vector2D.
     * @throws  {RangeError}                    Throws if direction is the zero vector.
     * @return  {Vector2D}                      A Vector2D representing the corner furthest 'support-ward'.
     */
    support(direction) {
        if (!(direction instanceof Vector2D)) {
            throw new TypeError('Direction must be an instance of Vector2D.')
        }
        if (direction.magnitude() === 0) {
            throw new RangeError('Direction must be non-zero.')
        }

        if (this.extents.magnitude() === 0) {
            return this.center
        }

        let i = 0
        let vertex
        let furthestVertex
        let furthestDistance = 0
        let distance

        do {
            // Pick a corner.
            switch (i) {
            case 0:
                vertex = new Vector2D(this.extents)
                break
            case 1:
                vertex.x *= -1
                break
            case 2:
                vertex.y *= -1
                break
            default: // 3
                vertex.x *= -1
                break
            }

            // If this corner is closest to the direction mark it as best.
            distance = Vector2D.dotProduct(vertex, direction)
            if (distance > furthestDistance) {
                furthestDistance = distance
                furthestVertex = vertex
            }

            i++
        } while (i < 4)

        // Adjust corner by the center.
        return Vector2D.add(furthestVertex, this.center)
    }

    /**
     * Validate that the provided arguments are vector like and return x and y to be used.
     * @method assertVectorLike
     * @param   {Object|Array|Vector2D|Number}  x   An x coordinate or object with x and y, an Array, or a Vector2D to
     *                                              translate this by.
     * @param   {Number}                        y   A y coordinate to translate this by.
     * @throws  {TypeError}                         Throws a TypeError if the provided arguments cannot be converted
     *                                              into x and y coordinates.
     * @return  {Object}                            Returns an object with x and y.
     */
    assertVectorLike(x, y) {
        if (typeof x === 'object') {
            if (Array.isArray(x)) {
                [x, y] = x
            } else {
                ({x = 0, y = 0} = x)
            }
        }

        if (typeof x !== 'number' ||
            typeof y !== 'number') {
            throw new TypeError('Arguments cannot be converted to x and y componenents.')
        }

        return {x, y}
    }

    /**
     * Translates the box by the given vector.
     * @method  translate
     * @alias   offset
     * @param   {Object|Array|Vector2D|Number}  [x=0]   An x coordinate or object with x and y, an Array, or a Vector2D
     *                                                  to translate this by.
     * @param   {Number}                        [y=0]   A y coordinate to translate this by.
     * @throws  {TypeError}                             Throws a TypeError if the provided arguments cannot be converted
     *                                                  into x and y coordinates.
     * @return  {AABBDD}                                Returns this, for chaining.
     */
    translate(x = 0, y = 0) {
        ({x, y} = this.assertVectorLike(x, y))

        this.center.x += x
        this.center.y += y

        return this
    }

    /**
     * Get the corner of this box nearest the origin.
     * @method getMin
     * @param   {Boolean}   getVector   Flag indicating that this method should return a Vector2D.
     * @return  {Object|Vector2D}       Returns an object with x an y or a Vector2D if the flag was true.
     */
    getMin(getVector) {
        let min = {
            x: this.center.x - this.extents.x,
            y: this.center.y - this.extents.y,
        }
        return getVector ? new Vector2D(min) : min
    }

    /**
     * Get the corner of this box furthest from the origin.
     * @method getMax
     * @param   {Boolean}   getVector   Flag indicating that this method should return a Vector2D.
     * @return  {Object|Vector2D}       Returns an object with x an y or a Vector2D if the flag was true.
     */
    getMax(getVector) {
        let max = {
            x: this.center.x + this.extents.x,
            y: this.center.y + this.extents.y,
        }
        return getVector ? new Vector2D(max) : max
    }

    /**
     * Get size of this box. i.e. the vector from the min corner to the max corner.
     * @method getSize
     * @param   {Boolean}   getVector   Flag indicating that this method should return a Vector2D.
     * @return  {Object|Vector2D}       Returns an object with x an y or a Vector2D if the flag was true.
     */
    getSize(getVector) {
        let size = {
            x: this.extents.x * 2,
            y: this.extents.y * 2,
        }
        return getVector ? new Vector2D(size) : size
    }

    /**
     * Scale this box in x and y.
     * @method  scale
     * @param   {Object|Array|Vector2D|Number}  [x=1]   An x component or object with x and y, an Array, or a Vector2D
     *                                                  to scale this by.
     * @param   {Number}                        [y=1]   A y component to scale this by.
     * @throws  {TypeError}                             Throws a TypeError if the provided arguments cannot be converted
     *                                                  into x and y componenents.
     * @return  {AABBDD}                                Returns this, for chaining.
     */
    scale(x = 1, y = 1) {
        ({x, y} = this.assertVectorLike(x, y))

        this.extents.x *= x
        this.extents.y *= y
        return this
    }

    /**
     * expand this box in x and y (by addition).
     * @method  expand
     * @param   {Object|Array|Vector2D|Number}  [x=0]   An x component or object with x and y, an Array, or a Vector2D
     *                                                  to expand this by.
     * @param   {Number}                        [y=0]   A y component to expand this by.
     * @throws  {TypeError}                             Throws a TypeError if the provided arguments cannot be converted
     *                                                  into x and y componenents.
     * @return  {AABBDD}                                Returns this, for chaining.
     */
    expand(x = 0, y = 0) {
        ({x, y} = this.assertVectorLike(x, y))

        this.extents.x += x
        this.extents.y += y
        return this
    }

    /**
     * Get area of this box.
     * @method getArea
     * @return  {Number}    The area of this box.
     */
    getArea() {
        return this.extents.x * this.extents.y * 4
    }

    /**
     * Returns true the argument is an instance of AABBDD with center and extents matching this one's.
     * @method equals
     * @param   {ABBDD}     other       An ABBDD to check for equivalency.
     * @throws  {TypeError}             Throws if the argmuent is not an instanc of AABBDD.
     * @return  {Boolean}               Returns true if the argument is an instance of AABBDD with center and extents
     *                                  that are Vector2D equals() to this one's center and extents respectively.
     */
    equals(other) {
        if (!(other instanceof AABBDD)) {
            throw new TypeError('Argument must be an instance of AABBDD.')
        }
        return this.center.equals(other.center) && this.extents.equals(other.extents)
    }

    /**
     * Test wether this box contains the given point.
     * @method  containsPoint
     * @param   {Object|Array|Vector2D} p           A object with x and y, an Array, or a Vector2D point to test.
     * @param   {Boolean}               exclusive   A flag indicating wether the test s exclusive or inclusive. i.e.
     *                                              wether the point is considered contained if it is on the perimeter
     *                                              of the box. inclusive by default.
     * @throws  {TypeError}                         Throws a TypeError if the provided point cannot be converted
     *                                              into x and y componenents.
     * @return  {Boolean}                           Returns true if the point is contained (false if not).
     */
    containsPoint(p, exclusive) {
        p = this.assertVectorLike(p)
        let min = this.getMin()
        let max = this.getMax()

        if (exclusive) {
            return (min.x < p.x &&
                    max.x > p.x &&
                    min.y < p.y &&
                    max.y > p.y)
        }
        return (min.x <= p.x &&
                max.x >= p.x &&
                min.y <= p.y &&
                max.y >= p.y)
    }

    /**
     * Get the point on the perimeter of this box nearest to the point passed
     * @method  nearestPointOnBounds
     * @param   {Object|Array|Vector2D} p           A object with x and y, an Array, or a Vector2D point to test.
     * @throws  {TypeError}                         Throws a TypeError if the provided point cannot be converted
     *                                              into x and y componenents.
     * @return  {Vector2D}                           Returns a new Vector2D representing the calculated point.
     */
    nearestPointOnBounds(p) {
        p = this.assertVectorLike(p)

        let min = this.getMin()
        let max = this.getMax()

        // FIXIT find better solution:

        let minDist = Math.abs(p.x - min.x)
        let pointX = min.x
        let pointY = p.y

        if (Math.abs(max.x - p.x) <= minDist) {
            minDist = Math.abs(max.x - p.x)
            pointX = max.x
            pointY = p.y
        }
        if (Math.abs(max.y - p.y) <= minDist) {
            minDist = Math.abs(max.y - p.y)
            pointX = p.x
            pointY = max.y
        }

        if (Math.abs(min.y - p.y) <= minDist) {
            minDist = Math.abs(min.y - p.y)
            pointX = p.x
            pointY = min.y
        }

        return new Vector2D(pointX, pointY)
    }

    /**
     * Test wether completely contains another.
     * @method containsAABB
     * @param   {AABBDD}    other   An AABBDD to test.
     * @throws  {TypeError}         Throws if the argument is not an instance of AABBDD.
     * @return  {AABBDD}            Returns true if this box contains the other.
     */
    containsAABB(other) {
        if (!(other instanceof AABBDD)) {
            throw new TypeError('Argument must be instances of AABBDD.')
        }
        let thisMin = this.getMin()
        let thisMax = this.getMax()
        let otherMin = other.getMin()
        let otherMax = other.getMax()

        return thisMin.x <= otherMin.x &&
            thisMax.x >= otherMax.x &&
            thisMin.y <= otherMin.y &&
            thisMax.y >= otherMax.y
    }

    /**
     * Test wether this box intersects another.
     * @method intersects
     * @param   {AABBDD}    other   An AABBDD to test.
     * @throws  {TypeError}         Throws if the argument is not an instance of AABBDD.
     * @return  {AABBDD}            Returns true if they boxes are touching.
     */
    intersects(other) {
        if (!(other instanceof AABBDD)) {
            throw new TypeError('Argument must be instances of AABBDD.')
        }

        let thisMin = this.getMin()
        let thisMax = this.getMax()
        let otherMin = other.getMin()
        let otherMax = other.getMax()

        return thisMin.x <= otherMax.x &&
            thisMax.x >= otherMin.x &&
            thisMin.y <= otherMax.y &&
            thisMax.y >= otherMin.y
    }

    /**
     * Create an AABBDD that encloses the given boxes.
     * @method combine
     * @static
     * @alias  enclose
     * @param   {AABBDD}    a       An AABBDD to enclose.
     * @param   {AABBDD}    b       An AABBDD to enclose.
     * @throws  {TypeError}         Throws if either argument is not an instance of AABBDD.
     * @return  {AABBDD}            Returns a new AABBDD enclosing the given boxes.
     */
    static combine(a, b) {
        if (!(a instanceof AABBDD) || !(b instanceof AABBDD)) {
            throw new TypeError('Arguments must be instances of AABBDD.')
        }

        let min = {}
        let max = {}

        let aMin = a.getMin()
        let aMax = a.getMax()
        let bMin = b.getMin()
        let bMax = b.getMax()

        min.x = Math.min(aMin.x, bMin.x)
        min.y = Math.min(aMin.y, bMin.y)

        max.x = Math.max(aMax.x, bMax.x)
        max.y = Math.max(aMax.y, bMax.y)

        let xExtent = (max.x - min.x) / 2
        let yExtent = (max.y - min.y) / 2

        return new AABBDD({
            center: new Vector2D(
                min.x + xExtent,
                min.y + yExtent,
            ),
            extents: new Vector2D(
                xExtent,
                yExtent
            ),
        })
    }

    /**
     * Get the Minkowski Difference of these two rectangles.
     * @method minkowskiDifference
     * @static
     * @param   {AABBDD}    a   An AABBDD to be differenced.
     * @param   {AABBDD}    b   An AABBDD to be differenced.
     * @throws  {TypeError}     Throws if either argument is not an instance of AABBDD.
     * @return  {AABBDD}        Returns a new AABBDD that is the Minkowski Difference of the two arguments.
     */
    static minkowskiDifference(a, b) {
        if (!(a instanceof AABBDD) || !(b instanceof AABBDD)) {
            throw new TypeError('Arguments must be instances of AABBDD.')
        }
        let aMin = a.getMin()
        let bMax = b.getMax()

        let extents = new Vector2D(
            a.extents.x + b.extents.x,
            a.extents.y + b.extents.y,
        )

        let center = new Vector2D(
            aMin.x - bMax.x + extents.x,
            aMin.y - bMax.y + extents.y,
        )

        return new AABBDD({
            extents,
            center,
        })
    }

}

module.exports = AABBDD
