'use strict';

const Backlog = require('./backlog.js');
const Kintone = require('./kintone.js');

module.exports.hello = (event, context, callback) => {
    console.log(`MESSAGE: ${process.env.MESSAGE}`);
    console.log(`YEAR: ${process.env.YEAR}`);

    console.log(event);

    const body = event['body'];

    try {
        const json = JSON.parse(body);

        if (json && json.message) {
            callback(null, {
                statusCode: 200,
                body: JSON.stringify({message: `${process.env.MESSAGE} ${json.message} ${process.env.YEAR}`})
            })
        } else {
            callback(null, {statusCode: 400, body: JSON.stringify({error: 'No message'})});
        }
    } catch (e) {
        console.log(e);
        callback(null, {statusCode: 400, body: JSON.stringify({error: 'Invalid JSON'})});
    }
};

module.exports.helloHelloHello = (event, context, callback) => {
    const callHello = (message) => {
        const request = require('request-promise');

        const params = {
            message: message
        };

        const options = {
            method: 'POST',
            uri: `http://localhost:3000/hello`,
            body: params,
            json: true
        };

        return request(options)
            .then(function (parsedBody) {
                return parsedBody;
            })
            .catch(function (err) {
                console.log(err);
                return null;
            });
    };

    const callHello3 = async (message) => {
        const response1 = await callHello(message);
        console.log(response1);

        const response2 = await callHello(response1.message);
        console.log(response2);

        const response3 = await callHello(response2.message);
        console.log(response3);

        callback(null, {statusCode: 200, body: response3.message});
    };

    callHello3('world');
};

module.exports.addIssueToBacklog = (event, context, callback) => {
    const backlog = new Backlog(
        process.env.BACKLOG_SPACE,
        process.env.BACKLOG_API_KEY,
        parseInt(process.env.BACKLOG_PROJECT_ID),
        parseInt(process.env.BACKLOG_ISSUE_TYPE_ID),
        process.env.BACKLOG_CFID_CREATED_BY,
        process.env.BACKLOG_CFID_KINTONE_RECORD_URL
    );

    const kintone = new Kintone(
        process.env.KINTONE_DOMAIN,
        parseInt(process.env.KINTONE_APP_ID),
        process.env.KINTONE_API_TOKEN
    );

    // Parse kintone webhook on create record
    console.log(event);
    const reqBody = JSON.parse(event['body']);
    if (reqBody['type'] != 'ADD_RECORD' || reqBody['record'] == null) {
        callback(null, {statusCode: 400});
        return;
    }

    const record = reqBody['record']
    const subject = record['Subject']['value']
    const description = record['Description']['value']

    let priorityId;
    if (record['Priority'] == '高') {
        priorityId = 2;
    } else if (record['Priority'] == '低') {
        priorityId = 4;
    } else {
        priorityId = 3;
    }

    const createdBy = `${record['CreatedBy']['value']['name']} ${record['CreatedBy']['value']['code']}`;
    const kintoneRecordNumber = record['RecordNumber']['value'];
    const kintoneRecordUrl = reqBody['url'];

    const addIssue = async (subject, description, priorityId, createdBy, kintoneRecordUrl, kintoneRecordNumber) => {
        const body = await backlog.addIssue(subject, description, priorityId, createdBy, kintoneRecordUrl);

        console.log('SUCCESS:');
        console.log(body);

        const backlogIssueUrl = `https://${process.env.BACKLOG_SPACE}/view/${body['issueKey']}`

        const body2 = await kintone.updateBacklogIssueUrl(kintoneRecordNumber, backlogIssueUrl);
        console.log('SUCCESS:');
        console.log(body2);

        callback(null, {statusCode: 200});
    };

    addIssue(subject, description, priorityId, createdBy, kintoneRecordUrl, kintoneRecordNumber);
};

module.exports.updateIssueOnKintone = (event, context, callback) => {
    const regexRecordNumber = /#record=(\d+)$/

    const kintone = new Kintone(
        process.env.KINTONE_DOMAIN,
        parseInt(process.env.KINTONE_APP_ID),
        process.env.KINTONE_API_TOKEN
    );

    // Parse Backlog webhook on update issue
    console.log(event);
    const reqBody = JSON.parse(event['body']);
    const content = reqBody['content'];

    let kintoneRecordNumber;
    for (const cf of content['customFields']) {
        if (cf['id'] === parseInt(process.env.BACKLOG_CFID_KINTONE_RECORD_URL)) {
            const m = regexRecordNumber.exec(cf['value']);
            if (m) {
                kintoneRecordNumber = parseInt(m[1]);
                break;
            }
        }
    }

    if (!kintoneRecordNumber) {
        callback(null, {statusCode: 400});
        return;
    }

    let closed;
    for (const ch of content['changes']) {
        // NOTICE: new_value is string
        if (ch['field'] === 'status' && ch['new_value'] === '4') {
            closed = true;
            break;
        }
    }

    if (!closed) {
        callback(null, {statusCode: 200});
        return;
    }

    const closeIssueOnKintone = async (kintoneRecordNumber, content) => {
        const body = await kintone.updateStatus(kintoneRecordNumber, '完了');

        console.log(body);

        if (content['comment'] && content['comment']['content']) {
            const body2 = await kintone.addComment(kintoneRecordNumber, content['comment']['content'])
            console.log(body2);
        }

        callback(null, {statusCode: 200});
    };

    closeIssueOnKintone(kintoneRecordNumber, content);
};
