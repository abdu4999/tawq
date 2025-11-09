from __future__ import annotations

from typing import Any, Dict, Optional

from . import FastAPI, Response


class TestClient:
    def __init__(self, app: FastAPI) -> None:
        self.app = app

    def _request(
        self,
        method: str,
        url: str,
        *,
        json: Any = None,
        data: Optional[Dict[str, Any]] = None,
        headers: Optional[Dict[str, str]] = None,
        params: Optional[Dict[str, Any]] = None,
    ) -> Response:
        headers = headers or {}
        if data is not None and headers.get("Content-Type", "").startswith("application/x-www-form-urlencoded"):
            form = {str(k): str(v) for k, v in data.items()}
        else:
            form = None
        return self.app.handle_request(
            method,
            url,
            headers=headers,
            query_params=params,
            json=json,
            form=form,
        )

    def get(self, url: str, *, headers: Optional[Dict[str, str]] = None, params: Optional[Dict[str, Any]] = None) -> Response:
        return self._request("GET", url, headers=headers, params=params)

    def post(
        self,
        url: str,
        *,
        json: Any = None,
        data: Optional[Dict[str, Any]] = None,
        headers: Optional[Dict[str, str]] = None,
        params: Optional[Dict[str, Any]] = None,
    ) -> Response:
        return self._request("POST", url, json=json, data=data, headers=headers, params=params)
