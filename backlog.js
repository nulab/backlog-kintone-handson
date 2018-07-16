module.exports = class Backlog {
    constructor (space, apiKey, projectId, issueTypeId, cfidCreatedBy, cfidKintoneRecordUrl) {
        this.apiKey = apiKey;
        this.projectId = projectId;
        this.issueTypeId = issueTypeId;
        this.endpoint = `https://${space}/api/v2/`;
        this.cfidCreatedBy = cfidCreatedBy;
        this.cfidKintoneRecordUrl = cfidKintoneRecordUrl;
    }

    addIssue(subject, description, priorityId, createdBy, kintoneRecordUrl) {
        const request = require('request-promise');

        const params = {
            projectId: this.projectId,
            summary: subject,
            issueTypeId: this.issueTypeId,
            priorityId: priorityId,
            description: description
        };
        params[`customField_${this.cfidCreatedBy}`] = createdBy;
        params[`customField_${this.cfidKintoneRecordUrl}`] = kintoneRecordUrl;

        const options = {
            method: 'POST',
            uri: `${this.endpoint}issues`,
            qs: {apiKey: this.apiKey},
            form: params
        };

        return request(options)
            .then(function (body) {
                return JSON.parse(body);
            })
            .catch(function (err) {
                return null;
            });
    }
};
