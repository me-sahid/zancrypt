from typing import Any, Iterable


def paginate(items: Iterable[Any], offset: int = 0, limit: int = 100) -> list[Any]:
    return list(items)[offset : offset + limit]
