---
title: 'How to Write Numpy Arrays to File Fast'
description: 'The fastest way to write out a NumPy array to file, tested against the "standard" methods for speed.'
date: 2020-09-24
---

## Background

Years ago I had just switched from Matlab to Python and was trying to convince my buddy at work to do the same. We argued about different reasons why he should switch, and one thing I brought up was speed. An example I threw out (without really knowing) was writing data to file. We kept arguing, but decided to settle it by testing an example problem.

I wrote up a quick script in Matlab to generate a random array of size m x n with a timing function to see how fast it would take to write out. I then did the same thing in Python using NumPy and it's _savetxt_ method. I ran both and I pretty much got the same times. Luckily, my buddy wasn't watching and I told him I had to get some other work done and I'd show him my results tomorrow. I had to figure out something, especially after being so confident. Below is what I came up with and I've been using this method ever since.

## Standard Method

Let's say you have a m x n float array and you want to write it to file using column-space delimitation. We'll use _%10.4f_ separated by spaces in this example.

```python
import numpy as np
m, n = 10000, 5
array = np.random.rand(m, n)
fmt = ' %10.4f %10.4f %10.4f %10.4f %10.4f'
```

In most code examples you'll see they'll write this using one of two methods. Either the _savetxt_ method, or using a for-loop. Both will result in very similar speeds.

### savetxt

This method is a one-liner and is pretty straight forward. You can read more about the method in [NumPy's documentation](https://numpy.org/doc/stable/reference/generated/numpy.savetxt.html)

```python
np.savetxt(fname, array, fmt=fmt)
```

### for-loop

Applying a for-loop on a NumPy array iterates through each of it's rows. You can turn each row into a string using the previously defined _fmt_ variable. Since we're only getting one row each time, we'll need to add a line return to _fmt_. Formatted strings in Python are expecting a tuple be passed to them. We can convert a 1-D NumPy array to a tuple using the built-in _tuple_ function.

```python
stream = ''
for row in array:
    stream += (fmt + '\n') % tuple(row)
with open(fname, 'w') as f:
    f.write(stream)
```

## Fast Method

I came up with this method after messing around with the for-loop way. The reason why the loop is necessary is because of the tuple requirement of Python's formatted strings. And the only way to get a usable tuple from a NumPy array is if it's 1-D. Applying the _tuple_ function on a 1 x n array will return a tuple of length n. However, applying _tuple_ on a m x n array will return a tuple of length m, with each item in the tuple being a NumPy array of size 1 x n. In other words, it turns a m x n array into a tuple of the arrays' rows.

If we want to get a usable tuple, then we'll have to flatten the array. We can use NumPy's _ravel_ method for that. Using it, we'll end up with a 1 x m\*n array which can be turned into a usable tuple. But wait, the tuple's size no longer matches our formated string template. _fmt_ is expecting 5 numbers and we have way more than that. We're actually m times off. Well what if you just multiplied _fmt_ by m? And that's the trick. No more for-loop!

```python
with open(fname, 'w') as f:
    f.write((fmt + '\\n') * m % tuple(array.ravel()))
```

## Speed Comparison

Here is a comparison of the difference in speed required to write out the previously defined array. Enjoy working with NumPy. It's an awesome library!

| Method   | Speed \[sec\] |
| -------- | ------------- |
| savetxt  | 19.5          |
| for-loop | 32.5          |
| fast     | 10.2          |

#### writeNumpy.py

```python
import timeit

testSetup = '''
import numpy as np
m, n = 10000, 5
array = np.random.rand(m, n)
fmt = ' %10.4f %10.4f %10.4f %10.4f %10.4f'
fname = 'test.txt'
'''

method1Code = '''
stream = ''
for row in array:
    stream += (fmt + '\\n') % tuple(row)
with open(fname, 'w') as f:
    f.write(stream)
'''

method2Code = '''
np.savetxt(fname, array, fmt=fmt)
'''
method3Code = '''
with open(fname, 'w') as f:
    f.write((fmt + '\\n') * m % tuple(array.ravel()))
'''

if __name__ == "__main__":
    repeat = 1
    iterations = 1000

    times1 = timeit.Timer(method1Code, setup=testSetup).repeat(repeat, iterations)
    times2 = timeit.Timer(method2Code, setup=testSetup).repeat(repeat, iterations)
    times3 = timeit.Timer(method3Code, setup=testSetup).repeat(repeat, iterations)
    print(min(times1))
    print(min(times2))
    print(min(times3))
```
