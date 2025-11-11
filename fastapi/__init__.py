from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Callable, Dict, Iterable, List, Optional, Tuple


class HTTPException(Exception):
    """Lightweight stand-in for FastAPI's HTTPException."""

    def __init__(self, *, status_code: int, detail: Any = None, headers: Optional[Dict[str, str]] = None) -> None:
        super().__init__(detail)
        self.status_code = status_code
        self.detail = detail
        self.headers = headers or {}


class status:
    HTTP_200_OK = 200
    HTTP_201_CREATED = 201
    HTTP_204_NO_CONTENT = 204
    HTTP_400_BAD_REQUEST = 400
    HTTP_401_UNAUTHORIZED = 401
    HTTP_403_FORBIDDEN = 403
    HTTP_404_NOT_FOUND = 404


class Depends:
    """Compatibility shim; dependency injection is handled manually."""

    def __init__(self, dependency: Callable[..., Any]) -> None:
        self.dependency = dependency


@dataclass
class Route:
    method: str
    path: str
    endpoint: Callable[..., Any]
    status_code: int


class APIRouter:
    def __init__(self, prefix: str = "", tags: Optional[List[str]] = None) -> None:
        self.prefix = prefix.rstrip("/")
        self.tags = tags or []
        self.routes: List[Route] = []

    def add_api_route(self, path: str, endpoint: Callable[..., Any], *, methods: Iterable[str], status_code: int = status.HTTP_200_OK) -> None:
        full_path = self._join_path(path)
        for method in methods:
            self.routes.append(Route(method=method.upper(), path=full_path, endpoint=endpoint, status_code=status_code))

    def _join_path(self, path: str) -> str:
        if not path:
            return self.prefix or "/"
        path = path if path.startswith("/") else f"/{path}"
        if not self.prefix:
            return path
        return f"{self.prefix}{path}"

    def get(self, path: str, *, status_code: int = status.HTTP_200_OK) -> Callable[[Callable[..., Any]], Callable[..., Any]]:
        def decorator(func: Callable[..., Any]) -> Callable[..., Any]:
            self.add_api_route(path, func, methods=["GET"], status_code=status_code)
            return func

        return decorator

    def post(self, path: str, *, status_code: int = status.HTTP_200_OK) -> Callable[[Callable[..., Any]], Callable[..., Any]]:
        def decorator(func: Callable[..., Any]) -> Callable[..., Any]:
            self.add_api_route(path, func, methods=["POST"], status_code=status_code)
            return func

        return decorator


class FastAPI:
    def __init__(self, *, title: str = "FastAPI") -> None:
        self.title = title
        self.routes: List[Route] = []

    def add_middleware(self, middleware: Callable[..., Any], **kwargs: Any) -> None:  # pragma: no cover - middleware is a no-op shim
        return None

    def include_router(self, router: APIRouter) -> None:
        self.routes.extend(router.routes)

    def add_api_route(self, path: str, endpoint: Callable[..., Any], *, methods: Iterable[str], status_code: int = status.HTTP_200_OK) -> None:
        for method in methods:
            self.routes.append(Route(method=method.upper(), path=path or "/", endpoint=endpoint, status_code=status_code))

    def get(self, path: str, *, status_code: int = status.HTTP_200_OK) -> Callable[[Callable[..., Any]], Callable[..., Any]]:
        def decorator(func: Callable[..., Any]) -> Callable[..., Any]:
            self.add_api_route(path, func, methods=["GET"], status_code=status_code)
            return func

        return decorator

    def post(self, path: str, *, status_code: int = status.HTTP_200_OK) -> Callable[[Callable[..., Any]], Callable[..., Any]]:
        def decorator(func: Callable[..., Any]) -> Callable[..., Any]:
            self.add_api_route(path, func, methods=["POST"], status_code=status_code)
            return func

        return decorator

    # Request handling --------------------------------------------------

    def handle_request(
        self,
        method: str,
        path: str,
        *,
        headers: Optional[Dict[str, str]] = None,
        query_params: Optional[Dict[str, Any]] = None,
        json: Any = None,
        form: Optional[Dict[str, Any]] = None,
    ) -> "Response":
        headers = headers or {}
        query_params = query_params or {}
        route, path_params = self._match_route(method.upper(), path)
        if route is None:
            return Response(status.HTTP_404_NOT_FOUND, {"detail": "Not Found"})
        request = Request(
            method=method.upper(),
            path=path,
            headers=headers,
            path_params=path_params,
            query_params=query_params,
            json=json,
            form=form or {},
        )
        try:
            result = route.endpoint(request, **path_params)
        except HTTPException as exc:
            return Response(exc.status_code, {"detail": exc.detail})
        if isinstance(result, Response):
            return result
        if isinstance(result, tuple) and len(result) == 2:
            payload, status_code = result
            return Response(status_code, payload)
        return Response(route.status_code, result)

    def _match_route(self, method: str, path: str) -> Tuple[Optional[Route], Dict[str, str]]:
        path = path or "/"
        for route in self.routes:
            if route.method != method:
                continue
            route_params: Dict[str, str] = {}
            if self._paths_match(route.path, path, route_params):
                return route, route_params
        return None, {}

    @staticmethod
    def _paths_match(pattern: str, path: str, captured: Dict[str, str]) -> bool:
        pattern_segments = [seg for seg in pattern.strip("/").split("/") if seg]
        path_segments = [seg for seg in path.strip("/").split("/") if seg]
        if not pattern_segments and not path_segments:
            return True
        if len(pattern_segments) != len(path_segments):
            return False
        for pattern_seg, path_seg in zip(pattern_segments, path_segments):
            if pattern_seg.startswith("{") and pattern_seg.endswith("}"):
                key = pattern_seg[1:-1]
                captured[key] = path_seg
            elif pattern_seg != path_seg:
                return False
        return True


class Request:
    def __init__(
        self,
        *,
        method: str,
        path: str,
        headers: Dict[str, str],
        path_params: Dict[str, str],
        query_params: Dict[str, Any],
        json: Any,
        form: Dict[str, Any],
    ) -> None:
        self.method = method
        self.path = path
        self.headers = headers
        self.path_params = path_params
        self.query_params = query_params
        self.json = json
        self.form = form


class Response:
    def __init__(self, status_code: int, payload: Any = None) -> None:
        self.status_code = status_code
        self._payload = payload

    def json(self) -> Any:
        return self._payload


__all__ = [
    "APIRouter",
    "Depends",
    "FastAPI",
    "HTTPException",
    "Request",
    "Response",
    "status",
]
