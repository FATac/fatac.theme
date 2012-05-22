# -*- coding: utf-8 -*-
import time


class ColumnIterator:

    def __init__(self, obj):
        self.obj = obj
        self.cnt = 0

    def __iter__(self):
        return self

    def next(self):
        try:
            result = self.obj.title(self.cnt)
            self.cnt += 1
            return result
        except IndexError:
            raise StopIteration


class Column:

    _dict = []

    def __init__(self):
        self._dict = self._build_dict()

    def __iter__(self):
        return ColumnIterator(self)

    def __len__(self):
        return len(self._dict)

    def title(self, i):
        return self._dict[i]

    def query(self, i):
        return self._dict[i]

    def _build_dict(self):
        return []


class CapitalLetterColumn(Column):

    def _build_dict(self):
        return list(u"ABCDEFGHIJKLMNOPQRSTUVXYZ")

    def query(self, i):
        return "AlphabeticalOrder:" + self._dict[i] + "*, class:Person"


class YearPeriodColumn(Column):
    """
        Represents a column with header a period of years
    """
    period_start = 1984
    period_end = time.localtime().tm_year
    period_length = 4

    def _period(self, i):
        end = self.period_length + i
        if (end > self.period_end):
            end = self.period_end
        return str(i) + '-' + str(end)

    def _build_dict(self):
        dict = []
        r = range(self.period_start, self.period_end, self.period_length + 1)
        for i in r:
            dict.append(self._period(i))
        return dict

    def query(self, i):
        return "Year:[" + self._dict[i].replace('-', ' TO ') + "], class:FrameActivity"
