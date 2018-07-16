module.exports = class Kintone {
    constructor (kintoneDomain, appId, apiToken) {
        this.appId = appId;
        this.apiToken = apiToken;
        this.endpoint = `https://${kintoneDomain}.cybozu.com/k/v1/`;
    }

    updateBacklogIssueUrl(recordNumber, url) {
        const request = require('request-promise');

        const params = {
            app: this.appId,
            id: recordNumber,
            record: {
                BacklogIssueURL: {
                    value: url
                }
            }
        };

        const options = {
            method: 'PUT',
            uri: `${this.endpoint}record.json`,
            headers: {'Content-Type': 'application/json', 'X-Cybozu-API-Token': this.apiToken},
            body: params,
            json: true
        };

        return request(options)
            .then(function (parsedBody) {
                return parsedBody;
            })
            .catch(function (err) {
                return null;
            });
    }

    updateStatus(recordNumber, status) {
        const request = require('request-promise');

        const params = {
            app: this.appId,
            id: recordNumber,
            record: {
                Status: {
                    value: status
                }
            }
        };

        const options = {
            method: 'PUT',
            uri: `${this.endpoint}record.json`,
            headers: {'Content-Type': 'application/json', 'X-Cybozu-API-Token': this.apiToken},
            body: params,
            json: true
        };

        return request(options)
            .then(function (parsedBody) {
                return parsedBody;
            })
            .catch(function (err) {
                return null;
            });
    }

    addComment(recordNumber, comment) {
        const request = require('request-promise');

        const params = {
            app: this.appId,
            record: recordNumber,
            comment: {
                text: comment
            }
        };

        const options = {
            method: 'POST',
            uri: `${this.endpoint}record/comment.json`,
            headers: {'Content-Type': 'application/json', 'X-Cybozu-API-Token': this.apiToken},
            body: params,
            json: true
        };

        return request(options)
            .then(function (parsedBody) {
                return parsedBody;
            })
            .catch(function (err) {
                return null;
            });
    }
};
