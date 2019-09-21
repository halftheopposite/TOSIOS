workflow "Deploy to Heroku" {
  on = "push"
  resolves = "release"
}

action "login" {
  uses = "actions/heroku@master"
  args = "container:login"
  secrets = ["HEROKU_API_KEY"]
}

action "push" {
  uses = "actions/heroku@master"
  needs = "login"
  env = {
    HEROKU_APP = "tosios-demo"
  }
  args = "container:push web"
  secrets = ["HEROKU_API_KEY"]
}

action "release" {
  uses = "actions/heroku@master"
  needs = "push"
  env = {
    HEROKU_APP = "tosios-demo"
  }
  args = "container:release web"
  secrets = ["HEROKU_API_KEY"]
}