# III. Distributed Programs as Ambients {distributed-programs-as-ambients}

The Ambients protocol defines both a programming model for distributed programs and a peer-to-peer distribution and computation network to run and share them. The programming model translates programs to a process-algebraic representation of distributed computation, which captures the meaning and expected behavior of a program when run in a distributed network, ensuring [safety](#properties-of-the-ambients-protocol).

In this section we describe:

- The [Programming model](#programming-model) for Ambients programs based on immutable values and [pure, total functions](https://en.wikipedia.org/wiki/Total_functional_programming)
- The [Formal basis](#process-algebra) for the programming model which is based on a [process algebra](https://en.wikipedia.org/wiki/Process_calculus) called [Ambient Calculus](#ambient-calculus)
- The algebraic Ambients programs defined in terms of [protocol primitives](#protocol-primitives), using [common computation abstractions](#computation-abstractions) as examples
- The Evaluation of Ambients programs as [confluent rewrite system](https://en.wikipedia.org/wiki/Confluence_(abstract_rewriting))

## Programming Model

The purpose of the programming model is to define an unambiguous translation between programs that developers write and executables that can be deployed, run, and shared in the Ambients network. This translation must retain the original meaning of the programs, which means that regardless of whether an Ambients program is run locally or remotely in the network, the evaluation must have the same end result. To achieve a deterministic end result, the programming model is based around _pure and total functions_ which are evaluated to _immutable values_.

Values are like [facts](https://gotocon.com/dl/goto-cph-2012/slides/value-of-values.pdf) [[58](#b0a5a7)] in that they don't change. Immutable values are important in distributed systems because it's the content which differentiates a value from another, not where they are located. This property makes content-addressing possible in systems like [Git](https://git-scm.com/) [[26](#3f3c2e)] or [IPFS](https://ipfs.io) [[29](#59ac11)] where values can be safely propagated and addressed around the system with negligible coordination overhead. For this reason, immutable values are the basis of Ambients programs as well.

Functions are [pure](https://en.wikipedia.org/wiki/Pure_function) if their evaluation is deterministic and does not affect any other evaluation outside themselves. Functions are total if they evaluate for all possible arguments, which also means that they must terminate. The Ambients programming model follows the [total functional programming paradigm](https://www.semanticscholar.org/paper/Total-Functional-Programming-Turner/2ce39c4f6c725082bf30e21ddb660c53026e88b5) [[62](#7c9b65)] and only allows programs to have pure and total functions.

Having a pure and total functional programming model has some powerful [benefits](https://alvinalexander.com/scala/fp-book/benefits-of-functional-programming) [[11](#bfd3ef)]. Most importantly, pure functions can be evaluated independently, in isolation, with no [_side-effects_](https://en.wikipedia.org/wiki/Side_effect_(computer_science)). Therefore, there can be no shared state between two pure functions, making them naturally concurrent and well-suited for distributed programming. Also, if the program is a function expression, which contains only pure function calls, then the expression is [_referentially transparent_](https://en.wikipedia.org/wiki/Referential_transparency). A referentially transparent function expression can simply be replaced with a computed value with no adverse consequences. Its behavior can be analyzed and verified with [equational reasoning](http://www.haskellforall.com/2013/12/equational-reasoning.html) [[19](#b51c38)]. Compilers can optimize pure functions using effective techniques such as [memoizing](https://en.wikipedia.org/wiki/Memoization), and [subexpression elimination](https://en.wikipedia.org/wiki/Common_subexpression_elimination).

However, the total functional programming model has some significant constraints. Because of the termination requirement, not every arbitrary program can be expressed using a total function. This excludes general-purpose programs with common features such as infinite loops and unbounded recursion. This is the _main limitation_ of the Ambients programming model, and overcoming this limitation would require a solution to the [halting problem](https://en.wikipedia.org/wiki/Halting_problem). On the other hand, restricting the program expressivity this way lets total functional program behavior be verifiable in the first place. The totality of a functional program means that there will be [_no_ runtime errors](https://kseo.github.io/posts/2015-06-18-total-functional-programming.html) [[61](#7df748)] - if the program compiles, it is proven to work with any input, and evaluating the program will always terminate with deterministic value. Finally, as [research on total functional programming](https://www.semanticscholar.org/paper/Total-Functional-Programming-Turner/2ce39c4f6c725082bf30e21ddb660c53026e88b5) [[62](#7c9b65)] has shown, there are various paths forward to introduce more expressivity while ensuring the totality, like allowing structural recursion for finite data and modeling infinite evaluation with corecursion over coinductive codata. Those paths are a part of [ongoing research on the Ambients protocol](#future-work).

Any program that can be modeled with total functions and immutable values becomes compliant with the programming model of the Ambients protocol, and therefore can be compiled to a distributed program. However, to safely execute the distributed programs the execution itself (i.e. each step of the program) needs to be verifiable. To achieve this, we must define a formal model of distributed computation.

### Process Algebra

Distributed systems are complex systems. Concurrency is key for building efficient, scalable systems, but it is also largely responsible for their complexity. Unexpected behaviors may appear even from the simplest interactions. It is next to impossible to test that distributed systems work properly. Even if we could observe the behavior of the whole distributed system reliably ([we can _not_](https://en.wikipedia.org/wiki/Byzantine_fault)), there are endless number of different states and combinations of actions that network participants are dealing with. This is the reason for modeling distributed systems formally, as having a mathematical framework makes it possible to verify the correct behavior in _all_ system states.

[_Correct-by-construction_](https://medium.com/rchain-cooperative/a-visualization-for-the-future-of-blockchain-consensus-b6710b2f50d6) [[7](#242a1d)] is a design philosophy recently popularized by the [CBC Casper](https://github.com/ethereum/cbc-casper/wiki) [[16](#17c395)] proof-of-concept. Things that are designed to be correct-by-construction use mathematical abstractions to model the thing itself and to prove its correctness. The implementation of a thing, then, needs to match the mathematical model for it to be considered correctly constructed.

There are multiple frameworks for modeling distributed computation. For example, [Petri nets](https://en.wikipedia.org/wiki/Petri_net) are a well-researched and well-suited tool for modeling the nondeterminism of concurrent behavior in static networks. The [Actor model](https://en.wikipedia.org/wiki/Actor_model) is a natural model for systems relying on asynchronous message passing with simple rules.

In the Ambients protocol, however, distributed programs are designed to be correct-by-construction by modeling their execution with an algebraic model known generally as *process algebra*.

[Process algebra](https://en.wikipedia.org/wiki/Process_calculus) is a family of algebraic approaches for modeling distributed computation. Process-algebraic expressions describe a concurrent system using independent _processes_ as terms and _interactions_ between processes as operators. This works as a model of distributed computation because independent, parallel processes capture the nondeterministic behavior, and interactions between them become computations with well-defined reduction rules. The most significant benefit of an algebraic approach is that it makes [equational reasoning](https://en.wikipedia.org/wiki/Universal_algebra) possible. This is important not only for proving correctness, but also for ensuring the computability of the program, which is crucial for a total functional programming model (as previously discussed).

For example, proving the correct behavior of a distributed system is possible by modeling the system as a labeled transition system, which consists of [system states and transitions between those states](https://pdfs.semanticscholar.org/53dc/59ccc2e83a67bcd950404697b1e8a8f06156.pdf) [[63](#90ec01)]. Process algebras define a labeled transition system where reduction rules of the algebra constrain the transitions between states. This forms a rule system for transitions between computation states, making various functional verification and analysis methods possible:

- Reachability analysis - ensuring that confidential information can only be shared between trusted parties during computation
- Specification matching - ensuring that third-party computation is equivalent with expected result
- Model checking - ensuring that logical propositions are true between any state changes

Various process algebras have been devised over the years, like [CSP](https://en.wikipedia.org/wiki/Communicating_sequential_processes) and [π-calculus](https://en.wikipedia.org/wiki/%CE%A0-calculus), all with characteristic properties. The [ambient calculus](https://en.wikipedia.org/wiki/Ambient_calculus) is a process algebra with distinct properties that make it the most suitable modeling framework for the Ambients protocol (and inspired the name of the protocol, too).

### Ambient Calculus

Ambient calculus, invented by Luca Cardelli and Andrew D. Gordon in their 1998 paper ["Mobile Ambients"](http://lucacardelli.name/Papers/MobileAmbientsETAPS98.A4.pdf) [[40](#9a9613)], introduced the concept of _mobile ambients_. The original ambient calculus has inspired many variants such as [_Boxed Ambients_](http://www.dsi.unive.it/~michele/Papers/tacs01.pdf) [[13](#cb9199)], [_Push and Pull Ambients_](https://link.springer.com/content/pdf/10.1007%2F978-0-387-35608-2_45.pdf) [[43](#37162d)], and [_Virtually Timed Ambients_](http://einarj.at.ifi.uio.no/Papers/johnsen16wadt.pdf) [[2](#2284e6)], which all extend the original algebra for various purposes. The Ambients protocol uses a variant called [_Robust Ambients_ (ROAM)](http://www-sop.inria.fr/mimosa/personnel/Xudong.Guan/papers/roam.pdf) [[38](#552956)] because of its safe, expressive, and intuitive co-capabilities and reduction rules.

We introduce the ambient calculus concepts along with a textual syntax for ROAM, which is used in examples throughout this paper. The same syntax is parseable by the [AmbIcobjs-tool](http://www-sop.inria.fr/mimosa/ambicobjs/) [[8](#e77b77)], which can be used to simulate the ambient programs and explore their properties and behavior.

It should be noted that as ROAM calculus is used as a _model of distributed computation_, all ROAM expressions presented with the textual syntax in this paper should be considered as human-readable representations of [generated programs](#compilation-model), not human-writable Ambients program source code. Full-scale, real-world Ambients programs, represented as ambient calculus expressions, grow too large to display in this paper and we will focus on introducing simplest building blocks that compose to bigger programs. These representations and their dynamics are useful for understanding the basis of guarantees that the [Compilation Model](#compilation-model) and the [Execution Model](#execution-model) provide later in this paper.

#### Ambient Calculus Syntax

<table>
  <tr>
    <td><i><pre class="top">P,Q ::=</pre></i></td>
    <td class="description"><strong>processes</strong></td>
  </tr>
  <tr>
    <td><i><pre>P|Q</pre></i></td>
    <td class="description">composition of parallel processes <i>P</i> and <i>Q</i></td>
  </tr>
  <tr>
    <td><i><pre>n[P]</pre></i></td>
    <td class="description">ambient <i>n</i> with nested process <i>P</i></td>
  </tr>
  <tr>
    <td><i><pre>M.P</pre></i></td>
    <td class="description">wait for action <i>M</i> before continuing as process <i>P</i></td>
  </tr>
  <tr>
    <td><i><pre class="top">M ::=</pre></i></td>
    <td class="description"><strong>capabilities and co-capabilities (actions)</strong></td>
  </tr>
  <tr>
    <td><i><pre>in n</pre></i></td>
    <td class="description">can enter ambient <i>n</i></td>
  </tr>
  <tr>
    <td><i><pre>in_ n</pre></i></td>
    <td class="description">allow ambient <i>n</i> to enter</td>
  </tr>
  <tr>
    <td><i><pre>out n</pre></i></td>
    <td class="description">can exit ambient <i>n</i></td>
  </tr>
  <tr>
    <td><i><pre>out_ n</pre></i></td>
    <td class="description">allow ambient <i>n</i> to exit</td>
  </tr>
  <tr>
    <td><i><pre>open n</pre></i></td>
    <td class="description">can open ambient <i>n</i></td>
  </tr>
  <tr>
    <td><i><pre>open_</pre></i></td>
    <td class="description">can be opened</td>
  </tr>
</table>

The curious reader is advised to check the full details of the syntax in the [Mobile Ambients](http://lucacardelli.name/Papers/MobileAmbientsETAPS98.A4.pdf) [[40](#9a9613)] and [Robust Ambients](http://www-sop.inria.fr/mimosa/personnel/Xudong.Guan/papers/roam.pdf) [[38](#552956)] papers.

#### Ambient - The Computation Container

The _ambient_ is the fundamental computation abstraction in ambient calculus. It is a computation container, with well-defined boundaries that separate an ambient from other ambients and isolate its internal computation from the outside world. Being enclosed inside an ambient, the computation has an unambiguous execution context and is not influenced by anything that happens outside the ambient. This means that the ambient calculus can model systems where programs need to have deterministic outcomes, regardless of their execution location, and can also track how and where programs are being distributed during execution.

Ambients are addressed by name. Every ambient has a name, which is used to control and authorize all actions, access, and behavior of the ambient. Two distinct ambients can share a name, which is a powerful property when modeling non-deterministic behavior of parallel processes (we'll discuss why this is so powerful in the later chapters). Once an ambient is created, there's no way to change its name while it exists, which means that names are _unforgeable_. Because of this integrity guarantee, ambient names can carry deeper meaning than just being an identifier. For example, the Ambients protocol uses names to specify [type information](#types) in data structures. Using the ROAM syntax, the ambient expression describing an ambient is simply:

```
a[]
```

Here `a` is a name of the ambient and the square brackets define the _boundaries_ of the ambient, everything inside them is isolated from other ambients outside `a`.

As a container, ambients form a spatial structure where they can be composed in parallel or in a hierarchy. Each ambient has an unambiguous location and an ambient can exist in parallel to other ambients or inside another ambient. Each ambient is isolated from the outside world, and therefore has no knowledge of their surrounding ambients, but they are aware of nested ambients inside them. An ambient expression describing this structure is written (in ROAM syntax) as:

```
a[ b[] ] | c[]
```

Here `a[...]`, `b[]` and `c[]` are all distinct ambients, where `a[...] | c[]` is a parallel composition of ambients `a` and `c`, and `a[ b[] ]` is a hierarchical composition of ambients `a` and `b`.

Composing ambients in such a way has powerful consequences for modeling distributed processes and inter-process relationships, because every ambient is always located either in the same or in a parallel hierarchy with any other ambient. This insight allows different [evaluation strategies](#evaluation-strategies) to be applied to differentiate when a computation is remote or local: when two ambients are composed in parallel, they are remote to each other, whereas a nested ambient is local to its enclosing ambient.

These are all examples of _immobile_ ambients. The distributed system they model is also immutable. Immobile ambients are considered to be equivalent to immutable values of the [Ambients programming model](#programming-model). The equivalence of ambients is important because [referential transparency](#programming-model) in a programming model can be verified using [equivalence relations](https://en.wikipedia.org/wiki/Equivalence_relation), like [structural congruence](https://en.wikipedia.org/wiki/%CE%A0-calculus#Structural_congruence) and [bisimilarity](https://en.wikipedia.org/wiki/Bisimulation), which are formally provided by the ambient calculus. This guarantees that immobile ambients represent computations that are safely replaceable by immutable values during the evaluation _and_ that the ambient expressions modeling a program (which is guaranteed to terminate), will reduce to an immobile ambient expression.

#### Ambient Capabilities

Having static and immobile ambient structures is not enough to model distributed computation. In the ambient calculus, ambients can contain not only other ambients but also _capabilities_. Capabilities can be characterized as _instructions_ how to react with other ambients and as a controlled way to communicate over the ambient boundaries. The ROAM calculus extended the original ambient calculus with _co-capabilities_ for additional control. Co-capabilities are dual to capabilities in that for every instruction to change or move an ambient, there must be a corresponding _authorization_, the co-capability, for a change or movement to happen.

First, the `in` capability and its `in_` co-capability define the interaction between two parallel ambients where one ambient is entering the other. This means that the following _reduction_ (denoted by the arrow `→`) of an ambient expression can take place:

```
  a[in b] | b[in_ a]
→           b[ a[] ]
```

The above can be interpreted as a program of "if `a` is entering `b` and `b` is allowing `a` to enter, then `a` moves inside `b`". It's important to note that this reduction or _computation step_, as per the ambient calculus reduction rules, requires that both `in` and `in_` are consumed at the same logical time. In other words, the reduction is not complete and the computation step doesn't happen until both ambients have changed.

Second, the `out` capability and its `out_` co-capability define the interaction between the enclosing and nested ambients where the nested ambient exits the enclosing one. This means that the following reduction of an ambient expression can take place:

```
  b[a[out b]|out_ a]
→ b[               ] | a[]
```

The above can be interpreted as a program of "if `a` is exiting `b` and `b` is allowing `a` to leave, then `a` moves out of `b` as a parallel ambient". Again, for the reduction to be fully complete and the computation step to happen, it's required that both the `out` capability and the `out_` co-capability are consumed at the same time.

Finally, the `open` capability and its `open_` co-capability define the interaction between the enclosing and nested ambient where the enclosing ambient "opens the container" by removing the boundary of the target ambient, which exposes everything inside its boundaries to the surrounding ambients. In a way, the opened ambient is _dissolved_. This means that the following reduction of an ambient expression can take place:

```
  a[b[open_|c[]]|open b]
→ a[        c[]        ]
```

Here the reduction can be interpreted as "if `a` wants to open `b` and `b` allows this, then `b` and its boundaries disappear and everything inside `b` becomes nested inside `a`". Again, both the `open` capability and the `open_` co-capability must be consumed before the reduction is complete and the computation step can happen. Notably, the `open_` co-capability doesn't need a target because the enclosing ambient is the only one that can open it.

Capabilities and co-capabilities can also be defined in _paths_, which models the computation steps that need to be executed sequentially. Consider the following example of an ambient expression and its reduction:

```
  a[in c] | b[in c] | c[in_ a.in_ b.in d] | d[in_ c]
→           b[in c] | c[in_ b.in d | a[]] | d[in_ c]
→                     c[in d | b[] | a[]] | d[in_ c]
→                                           d[c[b[] | a[]]]
```

In the above example, the initial path expression `in_ a.in_ b.in d` of ambient `c` can be read as "first let `a` enter, then let `b` enter, then enter `d`". Path sequences are an essential tool for controlling non-determinism in the concurrent ambient expressions. For example, if the above example was defined using a parallel composition of capabilities instead of sequential path:

```
a[in c] | b[in c] | c[in_ a|in_ b|in d] | d[in_ c]
```

the first reduction and computation step would be a non-deterministic choice of the following:

```
#1: →         b[in c]|c[a[]  |in_ b|in d]|d[in_ c]
#2: → a[in c]        |c[in_ a| b[] |in d]|d[in_ c]
#3: → a[in c]|b[in c]                    |d[c[in_ a|in_ b]]
```

where the third option is a deadlock situation in which `a` and `b` are unable to be computed further.

Co-capabilities, which the ROAM calculus introduced, are expressive enough to model situations where concurrent processes are competing over limited resources. Like in all distributed systems, this competition has a non-deterministic outcome. As mentioned earlier, having ambients with the same name allows modeling non-deterministic behavior in parallel processes which can be observed in an ambient expression:

```
  a[in b|c[]] | a[in b|d[]] | b[in_ a]
→ a[in b|c[]] |               b[a[d[]]]
OR
→               a[in b|d[]] | b[a[c[]]]
```

In the above example, there are two `a` ambients entering `b` which has only one `in_` co-capability to be consumed, so this expression can non-deterministically reduce to either `a[in b|c[]] | b[a[d[]]]` or `a[in b|d[]] | b[a[c[]]]`. Ambients with same name are a cause of _interference_, which generally means there are unwanted, unpredictable side-effects of non-determinism when modeling distributed computations. These side-effects can range from [security issues](http://www-sop.inria.fr/mimosa/personnel/Xudong.Guan/papers/roam.pdf) [[38](#552956)] to [distributability issues](https://arxiv.org/pdf/1808.01599.pdf) [[44](#5b865a)]. The Ambients protocol mitigates these issues on model-level by minimizing the chance of interference by defining [computation primitives](#computation-primitives) based on the ROAM calculus, and during runtime with [execution model construction](#execution-model) guarantees, which enforce unique identifiers for distinct ambients.

In conclusion, the capabilities and co-capabilities transform ambients from static, immobile and immutable structures representing _values_ to dynamic, mobile and mutable structures representing _computations_. As the [Ambient programming model](#programming-model) is based on functions that are guaranteed to terminate, any ambient that reduces to a _value ambient_ is considered to be equivalent to a _function execution_.

## Protocol Primitives

Not all mobile ambients seem to be translatable to values and functions in a way that makes sense for programs. For example, what kind of function would a mobile ambient `a[in b]` represent, or what kind of value does `hello[]` represent? We realize that to model actual values and functions and to compose them to full-blown programs, there needs be some transformation between the calculus and features present in programming models, like function arguments, evaluation scopes, data types etc. The Ambients protocol introduces a set of _protocol primitives_ which provide a translation from programming constructs to an _encoding_ of a program as ROAM expressions.

In the Ambients protocol, [_values_](#values) are the elementary construct to which all computations reduce. In other words, the result of every computation in Ambients, is a value. The computations are represented by _protocol primitives_ which  consist of [_computation primitives_](#computation-primitives) and [_distribution primitives_](#distribution-primitives).

_Protocol primitives_ are ambients which have special purpose in all Ambients programs. They are designed to assist remote and local computations with eventually converging to their final result. We define the following four primitives to encode programs as ambients:

- [`func`](#computation-context-func)-ambient, which creates a distributable computational context for function evaluation
- [`arg`](#computation-parameter-arg)-ambient, which transfers values and functions between computational contexts
- [`call`](#request-computation-call)-ambient, which initiates function evaluation sequences
- [`return`](#return-computation-return)-ambient, which redirects remote or local code to a computational context where evaluation happens

Next, we'll define what values are in Ambients as they define the ultimate result of all protocol primitives - to encode a distributed program as a function that reduces to a value. We will then continue to define the protocol primitives.

### Values

Values in the Ambients protocol are ambients that cannot be changed, which also means that *all values in the protocol are immutable*.

Informally, an ambient is a *value* if it *doesn't* have any capabilities or co-capabilities _and_ all its nested ambients are values as well. Consider the following two examples of this distinction:

- `string[hello[]]` is a value because it can't be reduced any further
- `string[hello[]|open_]` is not a value, because while `string` does contain the value `hello`, the expression can be reduced further (the existence of `open_` co-capability)

Even though `string[hello[]]` is a value and can't be directly manipulated, it can be moved around if it's inside another ambient. This is an important distinction that allows values to be encapsulated into other ambients for operations, such as transformations, distribution, building [persistent data structures](https://en.wikipedia.org/wiki/Persistent_data_structure), or signifying types, while the value itself stays immutable.

Evaluation of values just in terms of process algebra is limited. The protocol primitives do not offer any equivalence relation with structurally different but semantically similar values. This means that, for example, even if intuitively `string[hello[]]` equals the string literal `"hello"`, the encoded programs cannot combine `string[hello[]]` with `string[world[]]` in any meaningful way to form `string[helloworld[]]` to represent its string literal `"helloworld"`. Instead, equivalence is expressed by encoding programs so that they reduce to _deterministic values_ which have a _deterministic runtime interpretation_. Programs may reduce either simple values like `string[helloworld[]]` or structured value expressions, like [monoids](#monoids) such as `string[concat[left[string[hello[]]]|right[string[world[]]]]]`. The real equivalence of these value expressions is determined at runtime, as defined by the [Execution Model](#evaluating-results). Because the runtime interpretation is required to be deterministic, it gives a deterministic real-world meaning to every Ambients value expression. This means that the Ambients protocol as a whole can guarantee the equivalence of program encodings `"hello" + "world"` and `"helloworld"`, which is needed for [referential transparency](#programming-model).

The concept of a value as an algebraic expression, and its deterministic evaluation, is the core of the ambients program encoding. The [Ambients Programming Model](#programming-model) requires that programs must be pure, deterministic and total. To interpret these requirements as algebraic expressions, all programs must always reduce to a value, that is, they finish and terminate. In addition, the expressions must reduce to the same value for the same inputs, that is, they're pure and deterministic. In the next section we introduce core [computation primitives](#computation-primitives) which are used to encode functions that eventually reduce to values.

### Computation Primitives

The [Ambients Programming Model](#programming-model) ensures that all programs will terminate, which means that their eventual end result is an _immutable value_. When encoding programs as Ambients, the final result is represented by an [immobile ambient](#ambient---the-computation-container). However, being distributed and possibly highly parallel, the Ambients programs have inherent, unavoidable non-determinism, which becomes a problem when the programming model requires that programs have deterministic outputs. At the same time, programs are expected to be composable. In order to have safe, composable and deterministic encoding and evaluation of programs, the Ambients protocol defines two primitives called `func` and `arg`.

#### Computation Context: `func`

The `func` primitive defines a computational context for function evaluation. It establishes an _evaluation scope_ and its behavior is similar to the widely established concept of [_function scoping_](https://en.wikipedia.org/wiki/Scope_(computer_science)).

Having a designated primitive for an evaluation scope allows Ambients programs to define parallel and sequential control flows that always converge to a deterministic value. As an ambient, `func` can be safely distributed as it isolates the computation inside it from other ambients, i.e. it preserves the integrity of its internal computation. In practice, this means that the runtime environment can use different [evaluation strategies](#evaluation-strategies) to decide whether a computation is evaluated locally or remotely (i.e. composed as either [nested or parallel](#ambient---the-computation-container) `func`s) or as a mix of both, and to track and verify the state of the computation with less complexity, in real time.

Informally, a `func` for a function `x` is defined as:

```
func[in_ x.open x.open_]
```

Here, the `func` primitive defines three, logically sequential phases:

1. Initiate the evaluation scope by allowing computation `x` to enter it with `in_ x`. This scope creates a safe addressing space for `x`, protected and isolated from other parallel computations outside `func`.
2. Evaluate the computation `x` by opening it with `open x`.
3. Reveal the computation result to the outside by allowing itself to be opened with `open_`.

The `func` above is fully reduced by the following steps (`result[]` representing an ad hoc computation result of `x`):

```
  func[in_ x.open x.open_] | x[in func.open_|result[]] |
  open func
→ func[x[open_|result[]] | open x.open_] | open func
→ func[result[] | open_]  | open func
→ result[]
```

#### Computation Parameter: `arg`

The `arg` primitive is used with `func` to transfer values and functions between ambients before their evaluation. This is how the protocol models function expressions with arguments. The `arg` primitive defines the [_argument binding_](https://en.wikipedia.org/wiki/Parameter_(computer_programming)) procedure between _parameters_ that are declared by functions, and _arguments_ that are passed to functions in function expressions.

Informally, `arg` acts as a container for an argument `x` to transfer it to a `func` to be evaluated as parameter `y`:

```
arg[in_ x.open x.in y.open_] |
y[in_ arg.open arg.in func.open_]
```

Here, the `arg` primitive defines the binding between the argument `x` and the parameter `y` in three, logically sequential phases:

1. The `arg` waits for an argument `x`, then evaluates it, and finally moves inside the parameter `y` to be evaluated.
2. The parameter `y` waits for an `arg`, then evaluates it, and finally moves inside a `func` to be evaluated.
3. When the parameter `y` is opened inside `func`, it will evaluate to whatever value or function the argument `x` originally contained.

The composite expression above is fully reduced to a `func` ready for evaluation by the following steps (where `input[]` represent an ad hoc value of input `x`):

```
  arg[in_ x.open x.in y.open_] | x[in arg.open_|input[]] |
  y[in_ arg.open arg.in func.open_] |
  func[in_ y.open y.open_]
→ arg[open x.in y.open_ | x[open_|input[]] ] |
  y[in_ arg.open arg.in func.open_] |
  func[in_ y.open y.open_]
→ arg[in y.open_|input[]] |
  y[in_ arg.open arg.in func.open_] |
  func[in_ y.open y.open_]
→ y[open arg.in func.open_|arg[open_|input[]]] |
  func[in_ y.open y.open_]
→ y[in func.open_|input[]] |
  func[in_ y.open y.open_]
→ func[open y.open_ | y[open_|input[]]]
→ func[open_ | input[]]
```

#### Function Expressions With `func` and `arg`

With just `func` and `arg` primitives, we can express all pure functions. The general rule for defining function expression is to compose the function declaration with the function evaluation. This simply means composing two `func`s - the _declaration-site_ which declares the parameter and the _call-site_ which passes the argument - and an `arg` to bind the argument to a parameter between the two `func`s.

For example, a function expression `message("hello")` is a composition of the function definition `message(x)` which declares the parameter `x`

```
message[
  in func.open_|
  func[
    x[in_ arg.open arg.in message.open_]|
    message[in_ x.open x]|
    in_ arg.open_
  ]
]
```

and the function evaluation which passes the value `string[hello[]]` as an argument:

```
func[
  in_ message.open message.open func.open_|
  arg[
    in func.in x.open_|
    string[hello[]]
  ]
]|
open func
```

Composing these together reduces the whole program to a value:

```
message[string[hello[]]]
```

To analyze the function encodings in general, let's categorize the encodable functions by their return type and the number of parameters they have.

Functions that expect zero parameters are _constant functions_, which means that they always evaluate to the same result. Constant functions returning values are used when values need to be transformed to a function-form, e.g. as arguments to generic functions. Constant functions that return functions are the basis for [locally evaluated functions](#evaluation-strategies). For example, JavaScript function `() => "hello"` can be encoded simply as a composition of the function definition and an evaluation without argument binding:

```
func[
  open_|
  string[hello[]]
]|
open func
```

Functions that expect more than zero parameters are generally ones that do more computation. Single-argument functions that return values are necessary for expressing transformations from input to output value. Single-argument functions that return functions enable [_currying_](https://en.wikipedia.org/wiki/Currying), which is how functions with more than one argument can be expressed.

### Distribution Primitives

The computation primitives encode distributed programs as ROAM expressions representing functions. In addition to function definition and evaluation, distribution of the functions is crucial for the protocol. The Ambients protocol defines two primitives, `call` and `return`, for controlled, safe, and modular distribution of programs and data.

#### Request Computation: `call`

The `call` primitive allows functions to call other functions which may be local or remote. Therefore, invoking a `call` can be seen as a starting point for distributing computational workload in any program.

Informally, a function `x`, which calls function `y`, creates a `call` primitive defined as:

```
call[out x.in y.open_]
```

Here, the `call` primitive has three sequential phases:

1. Exit function `x` with `out x`.
2. Enter function `y` with `in y`.
3. Reveal the _call payload_ to the function `y` by allowing `call` to be opened with `open_`.

The `call` above is fully reduced by the following steps (where `payload[]` represents an ad hoc computation payload):

```
  x[call[out x.in y.open_|payload[]] | out_ call] |
  y[in_ call.open call]
→ x[] | call[in y.open_|payload[]] | y[in_ call.open call]
→ x[] | y[call[open_|payload[]] | open call]
→ x[] | y[payload[]]
```

[`return`](#return-computation-return) is commonly used as a payload for `call`. The payload can also contain `arg`s, which enables partial or remote-only evaluation strategies.

#### Return Computation: `return`

The purpose of the `return` primitive is to include the needed instructions in a `call` to move the program control back to the _caller_, along with a result or remaining computation. Moving the control and the result back to the caller makes the evaluation of remote function possible as it's similar to the programming concept of replacing a function expression with a [return value](https://en.wikipedia.org/wiki/Return_statement). The `return` primitive also enables declaration of functions in ROAM expression in a way that decouples them from any potential caller.

Informally, a `return` which moves the control back to a function `x` is defined as:

```
return[open_.in x]
```

The [previous example](#request-computation-call), where the `payload` is replaced with a `return` primitive, is fully reduced by the following steps:

```
  x[
    call[out x.in y.open_|return[open_.in x]]|
    out_ call.in_ y
  ] |
  y[in_ call.open call.open return]
→ x[in_ y] | call[in y.open_|return[open_.in x]] |
  y[in_ call.open call.open return]
→ x[in_ y] |
  y[call[open_|return[open_.in x]]|open call.open return]
→ x[in_ y] | y[return[open_.in x]|open return]
→ x[in_ y] | y[in x]
→ x[y[]]
```

Here, the usage of `return` within `call` defines a logically sequential sequence, in addition to `call` handling:

1. After sending out the `call` to `y`, function `x` allows `y` to enter with `in_ y`.
2. After opening the `call`, function `y` opens the `return` primitive, which reveals the `in x` capability, making `y` to enter `x` for further evaluation. Due to the sequential `out_ call.in_ y` definition, any `y` will be authorized to enter `x` only once and after the `call` to `y` has moved out of `x`.

Because of this mechanism, the function `y` is unaware and fully decoupled from the caller `x` during the whole sequence, until it processes the `call` and the nested `return` and adopts the `in x` capability that redirects it back to the call-site `x`. Making the function `y` itself move, instead of creating some transient ambient representing a "return value", is a deliberate design choice which enables a variety of [distributed evaluation strategies](#evaluation-strategies).

### Evaluation Strategies

With the `call` and `return` primitives, compilers and VMs can safely use different strategies on how programs access functions and whether the programs are evaluated locally or remotely. This procedure is related to the concept of [partially applied functions](https://en.wikipedia.org/wiki/Partial_application).

To analyze the strategies, let's consider the example JavaScript function `const plus = (a, b) => a + b` which can be called with `plus(1, 2)`. In JavaScript, the function can be transformed to an equivalent, but _partially applicable_ function `const plus = (a) => (b) => a + b` which can be called with `plus(1)(2)`. The choice of returning functions instead of values is the basis for different distributed evaluation strategies.

A common pattern is local evaluation of a remote function, where a remotely defined `func` is moved to the local scope with `call` and `return` primitives and initiated with a local `arg` argument. Following the JavaScript example, this would be equivalent to a `const plus = () => (a, b) => a + b`. Partial and fully remote evaluation strategies rely on requiring the caller to include `arg`s for all or some of the function parameters within `call` before a function "returns", i.e. opens the `return` primitive.

Choosing between different evaluation strategies is a trade-off between performance and control. Local-only function evaluation relies on moving the function back to the caller once, after which it can be called repeatedly with different arguments, locally without network access. Fully remote function evaluation allows the remote function itself to control the function evaluation, similar to how the client-server and request-response based protocols work.

Ultimately, the choice whether to return a function is made by the declaring function itself and not the caller. Similarly, the available evaluation strategy options are controlled by the declaration-site. However, because all functions in the Ambients protocol are pure and total and programs are referentially transparent, the same function will return the same value when inputs are the same. This helps the execution runtime to cache functions locally and use the local evaluation more and more over time.

## Computation Abstractions

With just functions and values, it is possible to compose some very useful and universal higher-level abstractions using the computation primitives. In the following sections we describe how the protocol uses ambients and the computation primitives discussed in the previous chapter to define:

- [Types](#types) for having safer and more efficient computations
- [Monoids](#monoids) which represent data structures that are combined from other similarly typed data structures
- [Functors](#functors) which represent data structures that describe transformations between differently typed data structures

### Types

[Data types](https://en.wikipedia.org/wiki/Data_type) are one of the most useful abstractions for data structures and computations. There's a huge body of research studying the types and type systems in programming languages. To be able to generate efficient and safe executables, practically all established programming language compilers and runtimes rely on information about the type of data. We propose a simple but effective way to define type information in the Ambients protocol.

The protocol uses [value ambients](#values) in an effective way to represent types: the type is identified by the name of the ambient. This is similar to [nominal type systems](https://en.wikipedia.org/wiki/Nominal_type_system) where equality of types is based on name or signature. For example, a string literal:

```
"hello"
```

can be represented as an ambient:

```
string[hello[]]
```

Informally, `hello` could be seen as a program which returns some immutable binary value and `string` as a program which decodes that binary value to a human-readable text.

The name of the type in itself isn't meaningful, however. To execute distributed programs like these, there needs to be both a common understanding what a type such as `string` means in the [runtime environment](#runtime-environment), and a way to verify the [type safety](https://en.wikipedia.org/wiki/Type_safety) based on that data.

First, to establish the agreement about the meaning of types, the protocol runtime introduces a collection of commonly available [primitive data types](#primitive-data-types) as a part of the runtime environment. This is discussed in detail in the [Execution Model](#execution-model) chapter.

Second, to do any type checking for the data, it needs to be in a verifiable state. This is why the name of the ambient is a meaningful type name only when it has reduced to its final state, a value ambient. Values are the end result of converged distributed computation whereas non-values are ongoing computations with non-observable and distributed state, and therefore their evaluation and consequent type checking would be non-deterministic.

Linking ambients to types has some useful properties. First, just like ambient names, the type information cannot be erased or forged in runtime which is important for type-based optimization and verification. Second, an ambient can only exist in one place at a time and cannot be copied. This makes ambient-based type system a [linear type system](https://en.wikipedia.org/wiki/Substructural_type_system#Linear_type_systems). Linear types have been [previously researched](https://www.tweag.io/posts/2017-03-13-linear-types.html) [[34](#0f46b0)] as an effective way to implement fast memory management, because they make tracking the ownership of data and resources easier. In our ongoing research, we are looking into taking advantage of this to allow [protocol implementations](#the-virtual-machine) to mitigate real-world issues like implementing safe and scalable DAG compaction and garbage collection in content-addressed systems.

Types and type systems can greatly increase the safety of distributed programs with low amortized overhead and we believe the expressiveness, ergonomics, and safety of the ambient types can be improved in the future.

### Monoids

Data is a computation in itself. For example, when application or database state is considered as an accumulated history of state changes in the right order, the current state at any given time is the result of a computation that reduces all of the state changes into a single data structure. Some data structures and the operations on them are [algebraic structures](https://en.wikipedia.org/wiki/Algebraic_structure) called [monoids](https://en.wikipedia.org/wiki/Monoid).

Monoids are abstractions that are universally occurring everywhere in programming. A combination of a data and binary operation is a monoid if the operation's parameter types and return types are equal, the operation is associative, and there's an "identity element", like an empty value which is a starting point for the monoidal structure. For example, the following are monoids:

- Natural number addition (0 as an identity element)
- Natural number multiplication (1 as an identity element)
- String concatenation (empty string as an identity element)
- Committing a database transaction (commit as the binary function for merging two database "versions" to a new database "version", with the empty database as an identity element)

Monoids are useful because they are _the_ abstraction for data structure composition. With monoids we can safely compose a new data structure from two existing data structures of the same kind. Because of this, they are useful in composing distributed programs.l

For this purpose, in the Ambients Protocol a monoid is described as a hierarchical [value ambient](#values) structure, which retains the associativity of monoidal operations. Consider the string concatenation monoid as an [example](https://github.com/ambientsprotocol/encoding-examples/blob/master/monoids/locally-evaluated-string-concat.amb):

```
string_concat[
  in_ call.open call.(
    func[
      left[
        in_ arg.open arg.in string.in concat
      ]|
      right[
        in_ arg.open arg.in string.in concat
      ]|
      string[
        concat[in_ left|in_ right]|
        in_ left|in_ right
      ]|
      open_
    ]|
    open return.open_
  )
]
```

The hierarchical structure of the monoid is constructed by:

- `string_concat`, which represents the `+` function for two strings (the binary function), expecting `left` and `right` as arguments and which reduces to a `string` ambient containing a:
- `concat`, which represents the hierarchical structure, with `left` and `right` retaining the associative order. Here, the `concat`, `left`, and `right` are common operations for `string`, provided by the Execution Model

By using the computation primitives, these ambients reduce to immutable values describing the string concatenation operation of `left` and `right` values.

For example, the expression `"a" + "b"` reduces the ambients to a final value:

```
string[
  concat[
    left[string[a[]]]|
    right[string[b[]]]
  ]
]
```

And the expression `("a" + "b") + "c"` reduces the ambients to a final value:

```
string[
  concat[
    left[
      string[
        concat[
          left[string[a[]]|
          right[string[b[]]]
        ]
      ]
    ]|
    right[string[c[]]]
  ]
]
```

*Note how the structure of `"a" + "b"` remains immutable, i.e. the same in both examples, which is important for building monoidal structures efficiently.*

With this machinery, the whole monoid computation retains the closure and associativity properties needed for being a monoid. As the end result is defined entirely in terms of primitive types and common operations of the Execution Model, the value expression is [referentially transparent](#programming-model) and its evaluation is deterministic for all participants in the network.

### Functors

Like monoids, [functors](https://en.wikipedia.org/wiki/Functor) are prevalent higher-order abstractions that appear almost everywhere in functional programming. Informally, a functor represents anything that can be mapped over. It is an abstract data structure which provides a way to map, i.e. transform a data structure and the data it contains, to a new similar data structure.

For instance, arrays are a good example of functors. In JavaScript, we can write `[1, 2, 3].map(x => x * 2)` which is a mapping from an array of ints to another array of ints. This transformation function can map integers to anything, but the array functor makes sure the internal structure, i.e. the order of elements, is preserved. Many familiar data structures for arbitrary data like pairs, trees, or lists are examples of functors.

The power of functors come from its properties that originate from category theory. Most importantly they obey the [composition law](https://wiki.haskell.org/Functor#Functor_Laws) [[25](#0f5f18)]. In JavaScript, it means `["a", "bb"].map(x => x.length * 2)` is equal to `["a", "bb"].map(x => x.length).map(x => x*2)`. As compositionality is a key property and requirement for the protocol, it is important to be able to encode functors as computation primitives as well, adding to the abilities to compose data structures from other data structures.

Let's use the [`identity`-functor](https://blog.ploeh.dk/2018/09/03/the-identity-functor/) [[57](#3c4a46)] as an example, because it is a single-element container for arbitrary data, which makes it a functor without any internal structure. Therefore retaining the internal structure is a simple no-operation and we can focus just on transforming of the data. We observe there are four functions contributing to this mapping sequence in the [example found in our examples-repository](https://github.com/ambientsprotocol/encoding-examples/blob/master/functors/identity-functor.amb):

- `identity` which defines the structure
- `map_identity` which defines the mapping "implementation" function for `identity` structure, expecting execution arguments
	- `func` as a context for transformation function evaluation
	- `id` as the identity to map
- `string_length` which defines the transformation function, expecting a single argument `str` as a `string`-value for constructing `int[length[..]]`-values
- `program` itself which defines
	- `identity[string[hello[]]]` as the initial structure

Mapping an `identity[string[hello[]]]` to a new `identity[int[length[string[hello[]]]]]` by using the `string_length` transformation function is then achieved by composing the four functions together and applying the computation primitives:

1. `program` first fetches the `map_identity` to its execution context, and evaluates it, which opens holes for arguments `func` and `id`.
2. Then, `program` moves the initial `identity[string[hello[]]]` to the `id`-hole.
3. Then, `program` fetches the `string_length` function to its execution context in parallel and moves it to the `func`-hole, where `arg` primitive is used to transfer data from initial `identity` functor to `str`-hole of `string_length`, the last open hole in execution context.
4. When all the open holes in execution context are filled, the context is ready for evaluation.

After the execution context `func` is evaluated, the `program` reduces to the expected final value of a new functor:

```
identity[
  int[
    length[string[hello[]]]
  ]
]
```

This same machinery can be adapted to implement more useful functors like pairs, lists, and trees as well. Many of these are provided to the programs by the protocol [runtime environment](#runtime-environment) described in the [Execution Model](#execution-model).

Computational abstractions, like functors and monoids, are good examples of the expressiveness of the programming model that Ambients protocol and its computation primitives create. However, as discussed in the [programming model](#programming-model) section, there are algorithms and data structures that cannot be implemented given the intentionally constrained programming model which limits the expressiveness. [Later in this paper](#future-work) we discuss the future directions for Ambients protocol research, to have more expressive computation primitives and new computational abstractions, and to make more powerful runtime optimizations possible while still retaining the verifiable properties of the protocol.
