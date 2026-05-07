# Push30 — каталог партнёров

Информационный сайт: сетка карточек залов и дискаунт-партнёров, поиск, фильтры, модальные окна.

## Запуск

```bash
pip install -r requirements.txt
uvicorn app:app --reload --port 8000
```

Откройте http://127.0.0.1:8000/

Данные: `data/partners.json` (ключи `mainPartners`, `discountPartners`).

## Docker

```bash
docker compose up --build
```

Сервис слушает порт **8000**.
