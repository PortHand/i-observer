"use client";

import { sectionIds } from "../content/contactContent";
import { useContactHandler } from "../handler/useContactHandler";
import ContactDetails from "./ContactDetails";
import MessageForm from "./MessageForm";
import MessageSent from "./MessageSent";

export default function ContactSection() {
  const contact = useContactHandler();

  return (
    <section className="band band--light" id={sectionIds.message}>
      <div className="container section contact">
        <ContactDetails copied={contact.copied} onCopy={contact.handleCopyEmail} />
        <div className="card contact__panel">
          {contact.sent ? (
            <MessageSent
              message={contact.sent.message}
              ticket={contact.sent.ticket}
              headingRef={contact.sentRef}
              onSendAnother={contact.handleSendAnother}
            />
          ) : (
            <MessageForm
              // Remount when a prefill arrives, so the inputs pick up their new default values.
              key={JSON.stringify(contact.prefill)}
              defaults={contact.prefill}
              topic={contact.topic}
              showReference={contact.showReference}
              referenceRequired={contact.referenceRequired}
              messageLength={contact.messageLength}
              errors={contact.errors}
              sendError={contact.sendError}
              submitting={contact.submitting}
              formRef={contact.formRef}
              onTopicChange={contact.setTopic}
              onMessageLengthChange={contact.setMessageLength}
              onEdit={contact.clearError}
              onSubmit={contact.handleSubmit}
            />
          )}
        </div>
      </div>
    </section>
  );
}
