import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  buildInitialCustomerMessageTicketPatch,
  buildSupportRequestInsert,
  buildSupportRequestMessageInsert,
  buildSupportRequestPatchAfterMessage,
  mapPlatformSupportRequestMessageRow,
  mapPlatformSupportRequestRow,
} from '@/platform/support/supportRequestMappers';

describe('supportRequestMappers', () => {
  it('builds support request insert payload without message column', () => {
    const payload = buildSupportRequestInsert({
      userId: 'user-123',
      organizationId: 'org-456',
      product: 'buildcore',
      subject: 'Missing article',
      source: 'docs',
    });

    assert.deepEqual(payload, {
      user_id: 'user-123',
      organization_id: 'org-456',
      product: 'buildcore',
      subject: 'Missing article',
      source: 'docs',
      status: 'open',
      priority: 'normal',
    });
    assert.equal('message' in payload, false);
  });

  it('builds the first customer message insert payload', () => {
    const payload = buildSupportRequestMessageInsert({
      requestId: 'request-123',
      senderUserId: 'user-123',
      senderType: 'customer',
      message: 'I cannot find the workflow article.',
    });

    assert.deepEqual(payload, {
      request_id: 'request-123',
      sender_user_id: 'user-123',
      sender_type: 'customer',
      message: 'I cannot find the workflow article.',
    });
  });

  it('builds initial customer message ticket patch', () => {
    const patch = buildInitialCustomerMessageTicketPatch({
      timestamp: '2026-06-28T12:00:00.000Z',
    });

    assert.deepEqual(patch, {
      updated_at: '2026-06-28T12:00:00.000Z',
      last_customer_message_at: '2026-06-28T12:00:00.000Z',
    });
  });

  it('updates customer message timestamps and reopens waiting tickets', () => {
    const patch = buildSupportRequestPatchAfterMessage({
      senderType: 'customer',
      currentStatus: 'waiting_on_customer',
      timestamp: '2026-06-28T13:00:00.000Z',
    });

    assert.deepEqual(patch, {
      updated_at: '2026-06-28T13:00:00.000Z',
      last_customer_message_at: '2026-06-28T13:00:00.000Z',
      status: 'open',
    });
  });

  it('updates support message timestamps without changing status', () => {
    const patch = buildSupportRequestPatchAfterMessage({
      senderType: 'support',
      currentStatus: 'in_progress',
      timestamp: '2026-06-28T14:00:00.000Z',
    });

    assert.deepEqual(patch, {
      updated_at: '2026-06-28T14:00:00.000Z',
      last_support_message_at: '2026-06-28T14:00:00.000Z',
    });
  });

  it('maps support request rows to domain tickets', () => {
    const request = mapPlatformSupportRequestRow({
      id: 'request-123',
      user_id: 'user-123',
      organization_id: 'org-456',
      product: 'buildcore',
      subject: 'Missing article',
      source: 'docs',
      status: 'open',
      priority: 'normal',
      assigned_to_user_id: null,
      last_customer_message_at: '2026-06-28T12:00:00.000Z',
      last_support_message_at: null,
      closed_at: null,
      created_at: '2026-06-28T12:00:00.000Z',
      updated_at: '2026-06-28T12:00:00.000Z',
    });

    assert.equal(request.id, 'request-123');
    assert.equal(request.userId, 'user-123');
    assert.equal(request.product, 'buildcore');
    assert.equal(request.subject, 'Missing article');
    assert.equal(request.status, 'open');
    assert.equal(request.priority, 'normal');
    assert.equal(request.lastCustomerMessageAt, '2026-06-28T12:00:00.000Z');
  });

  it('maps thread messages for conversation loading', () => {
    const rows = [
      {
        id: 'message-1',
        request_id: 'request-123',
        sender_user_id: 'user-123',
        sender_type: 'customer' as const,
        message: 'Initial question',
        created_at: '2026-06-28T12:00:00.000Z',
      },
      {
        id: 'message-2',
        request_id: 'request-123',
        sender_user_id: 'staff-999',
        sender_type: 'support' as const,
        message: 'We published an update.',
        created_at: '2026-06-28T13:00:00.000Z',
      },
    ];

    const messages = rows.map(mapPlatformSupportRequestMessageRow);

    assert.equal(messages.length, 2);
    assert.equal(messages[0]?.senderType, 'customer');
    assert.equal(messages[0]?.message, 'Initial question');
    assert.equal(messages[1]?.senderType, 'support');
    assert.equal(messages[1]?.message, 'We published an update.');
  });
});
