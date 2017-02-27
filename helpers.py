import datetime, time
def parseJSTimeStamp(timestamp):
    return str(datetime.datetime.fromtimestamp(timestamp // 1e3))

# takes an array of boolean values
# and interprets it as a binary
# representation of an integer
def arrayToInt(arr):
    if (len(arr) == 0):
        return 0
    res = 0
    mx = len(arr) - 1
    for i, vi in enumerate(arr):
        v = int(vi) << (mx - i)
        res = res | v
    return res

# takes an integer and outputs an
# array representing it in binary
def intToArray(n):
    if (n == 0):
        return [False]
    res = []
    while (n > 0):
        res.insert(0, n % 2 == 1)
        n >>= 1
    while len(res) < 10:
        res.insert(0, False)
    return res
