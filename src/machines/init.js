import { getService } from "../utils/services"

import "../machines/bootstrap"
import "../machines/page-component"
import "../machines/page"
import "../machines/query-runner"
import "../machines/query-extractor"

// registerMachine(page, "page")
// registerMachine(queryRunner, "query-runner")
// registerMachine(queryExtractor, "query-extractor")

getService({ id: `bootstrap` })
getService({ id: `query-runner` })
getService({ id: `query-extractor` })
