var parts = window.location.pathname.split('/');

var curAccount = 'showcase';
var curProject = 'investment-portfolio-stock-market-simulation';
var model = 'portfolio.py';
var proto = /http(s)?/.test(window.location.protocol) ? window.location.protocol : 'https:';
proto = 'https:';
var host = window.location.host.match('local.forio') ? proto + '//api.forio.com' : proto + '//api.' + window.location.host;

if(parts[1] === 'app') {
    curAccount = parts[2];
    curProject = parts[3];
}

module.exports = {
    root: host + '/run/'+ curAccount + '/' + curProject,
    host: host,
    model: model,
    curAccount: curAccount,
    curProject: curProject,
    login: 'authentication',
    sessionCookieName: 'sim-session'
};
