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

    times1 = timeit.Timer(method1Code, setup=testSetup).repeat(
        repeat, iterations)
    times2 = timeit.Timer(method2Code, setup=testSetup).repeat(
        repeat, iterations)
    times3 = timeit.Timer(method3Code, setup=testSetup).repeat(
        repeat, iterations)
    print(min(times1))
    print(min(times2))
    print(min(times3))
