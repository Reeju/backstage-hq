import datetime as dt

from scripts.ci import pip_audit_ignores as pai

TODAY = dt.date(2026, 11, 11)


def _write(tmp_path, body):
    path = tmp_path / "ignore.toml"
    path.write_text(body)
    return str(path)


def test_empty_list_gives_no_flags(tmp_path, capsys):
    assert pai.main([_write(tmp_path, "# nothing\n")], TODAY) == 0
    assert capsys.readouterr().out.strip() == ""


def test_valid_entry_becomes_flag(tmp_path, capsys):
    body = '[[ignore]]\nid = "GHSA-1"\nreason = "unreachable"\nexpires = 2027-01-01\n'
    assert pai.main([_write(tmp_path, body)], TODAY) == 0
    assert capsys.readouterr().out.strip() == "--ignore-vuln GHSA-1"


def test_expired_or_reasonless_entry_fails(tmp_path):
    expired = '[[ignore]]\nid = "A"\nreason = "x"\nexpires = 2026-11-10\n'
    no_reason = '[[ignore]]\nid = "B"\nexpires = 2027-01-01\n'
    assert pai.main([_write(tmp_path, expired)], TODAY) == 1
    assert pai.main([_write(tmp_path, no_reason)], TODAY) == 1


def test_id_with_odd_characters_fails(tmp_path, capsys):
    body = '[[ignore]]\nid = "A B; rm -rf"\nreason = "x"\nexpires = 2027-01-01\n'
    assert pai.main([_write(tmp_path, body)], TODAY) == 1
    assert "id may only contain" in capsys.readouterr().err


def test_datetime_expiry_fails_without_traceback(tmp_path, capsys):
    body = '[[ignore]]\nid = "A"\nreason = "x"\nexpires = 2027-01-01T10:00:00\n'
    assert pai.main([_write(tmp_path, body)], TODAY) == 1
    assert "plain date" in capsys.readouterr().err


def test_expiry_more_than_90_days_away_fails(tmp_path, capsys):
    ok = '[[ignore]]\nid = "A"\nreason = "x"\nexpires = 2027-02-09\n'  # exactly +90 days
    far = '[[ignore]]\nid = "A"\nreason = "x"\nexpires = 2027-02-10\n'
    assert pai.main([_write(tmp_path, ok)], TODAY) == 0
    assert pai.main([_write(tmp_path, far)], TODAY) == 1
    assert "90 days" in capsys.readouterr().err
