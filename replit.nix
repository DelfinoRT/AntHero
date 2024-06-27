{ pkgs }: {
  deps = [
    pkgs.python3
    pkgs.python3Packages.flask
  ];

  // Optional: Any other dependencies you need

  shellHook = ''
    export FLASK_APP=app.py
    export FLASK_ENV=development
  '';
}
