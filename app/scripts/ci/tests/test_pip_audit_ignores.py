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
