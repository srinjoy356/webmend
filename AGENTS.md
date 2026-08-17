Before starting any task, read notes/plan.md first, then whichever of
   notes/architecture.md, notes/ui.md, notes/prompt.md, notes/tasks.md
   are relevant to the task at hand.

   After finishing meaningful work, append a dated entry to
   notes/progress.md (don't rewrite past entries). If you make a real
   architectural or rules-compliance decision, add it to
   notes/decisions.md following its existing ADR format.

   Never read from or write to notes/resources.md. It contains secrets
   and is not part of your context.

   For any UI work, follow notes/ui.md exactly: run /impeccable init
   once if PRODUCT.md doesn't exist yet, and never mark a screen done
   without running /impeccable audit and /impeccable polish on it.

STANDING VERIFICATION RULE: For any task involving file creation, CLI
commands, git operations, or checking whether something exists — always
paste the raw terminal/tool output in your response. A narrative
summary ("done," "created successfully," "confirmed") is never
sufficient on its own. If a command wasn't actually run, say so
explicitly rather than describing an expected outcome. If a file wasn't
actually created, say so rather than describing what it would contain.