# I built an AI agent that checks its own code. After 1,026 runs, it was no better than not checking.

*A small, honest experiment on "LLM checks LLM" — with every task, test and log open.*

Everyone building coding agents wants the same thing: an agent that doesn't just say "done", but *proves* it. The
obvious recipe is to have a second model check the first one's work. Write the tests separately, never show them to
the coder, run them, send the failures back, repeat.

I built exactly that during the Meta AI Developer Hackathon. The result surprised me. It's the reason this post exists.

## The setup

**Usta** (Turkish for "master craftsman") is a coding agent for Turkish speakers. You give it a task in Turkish, by
text or by voice. For example: "write a function that validates a Turkish IBAN", or "sum these invoice lines, Turkish
number format, VAT at 1/10/20 %". Then:

1. An **executor** model writes and runs the code in an isolated, network-less workspace, using tool calls.
2. **In separate calls**, a verifier model writes acceptance tests from the task text alone. It never sees the code,
   and the executor never sees the tests.
3. LLM-written tests can be wrong, so the verifier also writes a reference solution. Tests that the reference
   fails are dropped.
4. Failing tests go to an **arbiter** that enforces only what the task text clearly requires. Then they go back to
   the executor for up to three repair rounds. A round that breaks a previously passing test is rolled back.

The strongest version went further:
- three independent test writers;
- majority voting on which tests to keep;
- mutation testing: the verifier writes 12–16 deliberately broken versions of the reference solution, and tests are
  added until they catch them.

By the end, the acceptance tests caught **94% of these mutants**. On paper, a very strong verifier.

## How I measured it

The comparison was between three modes:

- **(a)** the executor alone,
- **(b)** the executor told to write and pass its own tests,
- **(c)** Usta: independent tests, arbiter, repair loop.

The tasks were 114 very hard, Turkey-specific coding tasks: tax IDs, IBAN checksums, invoice VAT, dates that slide
past public holidays, Turkish number formats. Each task had 12–20 **hidden tests** that neither the executor nor
Usta's test writer ever saw. Every task ran 3 times in every mode: **1,026 runs**, with zero infrastructure errors.

## The result

| Mode | Pass rate (95% CI) | "Done" verdicts that were actually correct |
|---|---|---|
| (a) executor alone | **60.2%** (52–68) | 63% |
| (b) + its own tests | 56.7% (49–64) | 61% |
| (c) Usta | 57.6% (49–65) | 60% |

Usta minus executor-alone: **−2.6 points** (95% CI −9.1 … +3.2). No significant difference, and the point estimate
is slightly *negative*.

The second column matters more than the first. When Usta said "verified", it was right 60% of the time. When the
executor simply said "done" on its own, it was right 63% of the time. **The verification badge did not make the
verdict more trustworthy.**

The same held on two other task sets (157 and 34 tasks), with two different executors (Muse Spark and the
open-weights Muse Glimmer 30B), across four versions of the verifier. No mode ever beat the executor alone
significantly.

## Why it didn't work

Here is one task, slightly simplified:

> *Write `topla(csv_path)` for an accounting office. Columns `tutar;adet;kdv_oran` (amount; quantity; VAT rate). Turkish
> number format. Empty quantity counts as 1… Return a dict with `toplam`, `kdv_toplam`, `bozuk_satir`.*

Input: one line, amount 10.00, quantity 2, VAT 10%. What is `toplam` (the total)?

- The executor said **22.00**: total *including* VAT. It gave this answer in all nine runs (three modes × three
  repeats).
- In all three Usta runs, the acceptance tests (36 to 61 of them) passed on that code. They either expected 22.00 or
  never checked it, and Usta reported "verified".
- The hidden test expected **20.00**: total *before* VAT, with VAT reported separately in `kdv_toplam`.

The task text never says which one it means. There was no code bug here. The two readings of an ambiguous
specification simply split, and the model writing the code and the model writing the checks landed on the same side.

There were 16 tasks where every run of the executor alone and every Usta run failed the hidden tests, while Usta's own
tests passed every time. Not all of them are ambiguities. One, for example, is a plain type bug, mixing `float` and
`Decimal`, that the acceptance tests never exercised. But the same shape kept recurring: the checks did not probe the
thing that went wrong.

That is the pattern behind most failures:

1. **The errors were mostly about reading the task, not writing the code.** Often the executor wrote correct code
   for a slightly different reading of the task.
2. **A verifier from the same model family shares those readings.** Writing tests independently, in separate calls,
   does not make them independent in *judgment*. The coder and the checker read the task the same way, so they agree,
   and agreement looks like verification.
3. **Mutation scores measure the wrong thing.** Catching 94% of mutants means the tests are sensitive to *small code
   changes*. They are blind to *what the code should do in the first place*.
4. **So coverage, not repair, is the bottleneck.** A repair round ran in only 38 of 342 Usta runs. When the tests
   don't probe a requirement, the loop has nothing to fix.

There is an uncomfortable corollary. In the example above, the hidden test came from the same model too, in yet
another call. Who is "right" about the VAT is itself a judgment. Part of what I measured as executor failure is
really ambiguity in the benchmark. All three judges came from one model family, so the absolute pass rates are
probably optimistic, and the true picture is noisier than the table suggests.

## What I'd take away

- **"A second LLM checks the first" is not verification, when both share a model family and a reading of the task.**
  It can still catch crashes and small bugs, but it won't catch the mistakes that matter most here.
- **If you build such a loop, measure it against hidden tests.** Measure with and without the loop, on the same
  tasks, with repeated runs. Without that, a green badge is a feeling.
- **The more promising directions are about the specification, not the code:** asking the user when a requirement is
  ambiguous ("total before or after VAT?"), verifiers from different model families, and tests derived from real
  examples rather than from the same task text.

## What Usta is good for

It still works end to end: Turkish voice or text, then code, then tests, then an evidence screen showing which tests
passed in which round, which were not enforced, and why. That record is useful. It just isn't a guarantee, and the
README says so.

Everything is open: code, all three task sets with hidden tests, every run's log, and the analysis scripts. The whole
project cost about $31 in API credit.

**Repo:** https://github.com/birtohum/usta · **Demo (3 min):** https://www.youtube.com/watch?v=f9RjvBsFDiU

*If you've seen a verifier loop that **does** beat the executor alone on hidden tests, I'd genuinely like to see the
numbers.*
