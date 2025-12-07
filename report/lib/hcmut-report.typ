#import "utils.typ": duallang
#import "settings/text.typ": setup-text
#import "settings/page.typ": setup-page
#import "settings/code.typ": setup-code
#import "settings/math.typ": setup-math
#import "settings/content.typ": setup-content
#import "titlepage.typ": titlepage
#import "summary.typ": make-summary

#let report(
  lang: "vi",
  author: "",
  subject: "",
  project: "",
  instructors: (),
  implementers: (),
  university_0: "VIETNAM NATIONAL UNIVERSITY - HO CHI MINH CITY",
  university_1: "HO CHI MINH CITY UNIVERSITY OF TECHNOLOGY",
  faculty: "FACULTY OF COMPUTER SCIENCE AND ENGINEERING",
  logo-path: "../lib/template/logo.png",
  print-mode: "oneside",
  toc: true,
  body
) = {
  set document(title: project, author: author)

  // 1. Title Page
  titlepage(
    project: project,
    subject: subject,
    instructors: instructors,
    implementers: implementers,
    university_0: university_0,
    university_1: university_1,
    faculty: faculty,
    logo-path: logo-path,
    lang: lang
  )

  // 2. Page Layout
  setup-page(
    print-mode: print-mode,
    subject: subject,
    lang: lang,
    
    // 3. Text & Heading Styles (includes Numbering)
    setup-text(
      lang: lang,
      
      // 4. Content Styles (Code, Math, Tables)
      setup-code(
        setup-math(
          setup-content(
            {
              // 5. Table of Contents
              if toc {
                 make-summary(lang: lang)
              }
              
              // 6. Main Body
              body
            }
          )
        )
      )
    )
  )
}